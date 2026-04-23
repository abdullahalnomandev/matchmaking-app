import QueryBuilder from '../../builder/QueryBuilder';
import { Consultation } from './consultation.model';
import { Company } from '../company/company.model';
import {
  ICreateConsultationPayload,
  IUpdateConsultationPayload,
  IConsultationFilters,
} from './consultation.interface';
import dayjs from 'dayjs';
import { USER_ROLES } from '../../../enums/user';
import { ConsultationRequest } from './request';
import mongoose from 'mongoose';
import { userRank } from '../user/user.util';

const createConsultation = async (
  payload: ICreateConsultationPayload,
  creatorId: string,
): Promise<any> => {
  // Check if company exists
  const company = await Company.findOne({
    owner: creatorId,
    _id: payload.company,
  });
  if (!company) {
    throw new Error(
      'You are not authorized to create consultation for this company',
    );
  }

  const consultationPayload = {
    ...payload,
    creator: creatorId,
  };

  console.log(consultationPayload);
  const consultation = await Consultation.create(consultationPayload);

  // Populate company and creator info
  await consultation.populate([
    { path: 'company', select: 'company_name company_website' },
    { path: 'creator', select: 'name email image' },
  ]);

  // Emit real-time event
  return consultation;
};

const getConsultations = async (query: IConsultationFilters) => {
  const today = dayjs().startOf('day').toDate();

  const role = query?.role || USER_ROLES.BUSINESS_USER;

  const filterQuery = {
    scheduledDate: { $gte: today },
  };

  const consultationQuery = new QueryBuilder(
    Consultation.find(filterQuery),
    query,
  )
    .paginate()
    .sort()
    .filter();

  let data = await consultationQuery.modelQuery
    .populate('company')
    .populate({
      path: 'creator',
      match: { role }, // ✅ filter here
      select: 'name email image role rank',
    })
    .lean();

  // ❗ remove items where creator didn't match
  data = data.filter(item => item.creator);

  const pagination = await consultationQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

const getConsultationById = async (consultationId: string): Promise<any> => {
  const consultation = await Consultation.findById(consultationId)
    .populate('company', 'name email image')
    .populate('creator', 'name email image');

  if (!consultation) {
    throw new Error('Consultation not found');
  }

  return consultation;
};

const getConsultationsByCompany = async (
  query: IConsultationFilters,
  companyId: string,
) => {
  // Check if company exists
  const company = await Company.findOne({ _id: companyId });
  if (!company) {
    throw new Error('Company not found');
  }

  const consultationQuery = new QueryBuilder(
    Consultation.find({ company: companyId }),
    query,
  )
    .paginate()
    .sort()
    .filter();

  const data = await consultationQuery.modelQuery
    .populate('company', 'name email image')
    .populate('creator', 'name email image')
    .lean();

  const pagination = await consultationQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

const getConsultationsByCreator = async (
  query: IConsultationFilters,
  creatorId: string,
) => {
  const today = dayjs().startOf('day').toDate();

  const dateFilter =
    query.type === 'upcoming'
      ? { scheduledDate: { $gte: today } }
      : query.type === 'completed'
        ? { scheduledDate: { $lt: today } }
        : {};

  const baseFilter = {
    creator: new mongoose.Types.ObjectId(creatorId),
    ...dateFilter,
  };

  const consultationQuery = new QueryBuilder(
    Consultation.find(baseFilter),
    query,
  )
    .paginate()
    .sort()
    .filter(['type']);

  const data = await consultationQuery.modelQuery
    .select('-status')
    .populate('company', 'company_name company_website')
    .populate('creator', 'name email image')
    .lean();

  if (!data.length) {
    return {
      data: [],
      pagination: await consultationQuery.getPaginationInfo(),
    };
  }

  const consultationIds = data.map(
    (c: any) => new mongoose.Types.ObjectId(c._id),
  );
  const requestCounts = await ConsultationRequest.aggregate([
    {
      $match: {
        consultation: { $in: consultationIds },
      },
    },
    {
      $group: {
        _id: '$consultation',
        approveToJoinCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0],
          },
        },
        pendingCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
          },
        },
      },
    },
  ]);

  const requestCountMap: Record<string, any> = {};
  requestCounts.forEach(item => {
    requestCountMap[item._id.toString()] = {
      approveToJoinCount: item.approveToJoinCount,
      pendingCount: item.pendingCount,
    };
  });

  const dataWithCounts = data.map((consultation: any) => ({
    ...consultation,
    requestCount: requestCountMap[consultation._id.toString()] || {
      approveToJoinCount: 0,
      pendingCount: 0,
    },
  }));

  const pagination = await consultationQuery.getPaginationInfo();

  return {
    data: dataWithCounts,
    pagination,
  };
};

const updateConsultation = async (
  consultationId: string,
  userId: string,
  payload: IUpdateConsultationPayload,
) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    creator: userId,
  });

  if (!consultation) {
    throw new Error(
      'Consultation not found or you are not authorized to update it',
    );
  }

  // Prevent updating completed or cancelled consultations
  if (
    consultation.status === 'COMPLETED' ||
    consultation.status === 'CANCELLED'
  ) {
    throw new Error('Cannot update completed or cancelled consultations');
  }

  const updatedConsultation = await Consultation.findByIdAndUpdate(
    consultationId,
    payload,
    { new: true, runValidators: true },
  ).populate([
    { path: 'company', select: 'company_name company_website' },
    { path: 'creator', select: 'name email image' },
  ]);

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(
      `consultation_updated::${consultation.company}`,
      updatedConsultation,
    );
    io.emit(`consultation_update::${consultation.company}`, {
      type: 'updated',
      data: updatedConsultation,
    });
  }

  return updatedConsultation;
};

const deleteConsultation = async (consultationId: string, userId: string) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    creator: userId,
  });

  if (!consultation) {
    throw new Error(
      'Consultation not found or you are not authorized to delete it',
    );
  }

  // Prevent deleting completed consultations
  if (consultation.status === 'COMPLETED') {
    throw new Error('Cannot delete completed consultations');
  }

  await Consultation.findByIdAndDelete(consultationId);

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(`consultation_deleted::${consultation.company}`, {
      consultationId: consultation._id,
      companyId: consultation.company,
    });
    io.emit(`consultation_update::${consultation.company}`, {
      type: 'deleted',
      data: { consultationId: consultation._id },
    });
  }

  return consultation;
};

const getUserBetterCallMe = async (query: IConsultationFilters , userId:string) => {
  console.log(query);
  const today = dayjs().startOf('day').toDate();
  const role = query?.role || USER_ROLES.BUSINESS_USER;

  // Get user ID from query (assuming it's passed as userId parameter)

  // Build query
  const consultationQuery = new QueryBuilder(
    Consultation.find({
      scheduledDate: { $gte: today },
    }),
    query,
  )
    .search(['title', 'name'])
    .filter([
      'company_name',
      'company_legal_name',
      'company_location',
      'company_website',
      'country',
      'vat_number',
      'company_id_number',
      'business_object',
      'business_types',
      'business_area',
      'experience',
      'positions',
      'annual_turnover',
      'companySearchTerm',
    ])
    .sort()
    .paginate();

  // Build dynamic company filter for populate
  const companyMatch: any = {};

  // List of all company fields that can be filtered
  const companyFields = [
    'company_name',
    'company_legal_name',
    'company_location',
    'company_website',
    'country',
    'vat_number',
    'company_id_number',
    'business_object',
    'business_types',
    'business_area',
    'experience',
    'positions',
    'annual_turnover',
  ];

  // Add filters for each company field if provided in query
  companyFields.forEach(field => {
    if (query[field]) {
      if (Array.isArray(query[field])) {
        companyMatch[field] = { $in: query[field] };
      } else if (typeof query[field] === 'string' && field.includes('name')) {
        companyMatch[field] = { $regex: query[field], $options: 'i' };
      } else {
        companyMatch[field] = query[field];
      }
    }
  });

  // populate with filters
  consultationQuery.modelQuery = consultationQuery.modelQuery
    .populate({
      path: 'company',
      match: Object.keys(companyMatch).length > 0 ? companyMatch : undefined,
    })
    .populate({
      path: 'creator',
      match: { role }, // filter by creator.role
      select: 'name email image role ranking_score',
    });

  // execute query
  let data = await consultationQuery.modelQuery.lean();

  // Get user's consultation requests if userId is provided
  let userRequests: any[] = [];
  if (userId) {
    userRequests = await ConsultationRequest.find({
      request_user: userId,
      consultation: { $in: data.map((c: any) => c._id) }
    }).select('consultation status');
  }

  // Create a map of consultation ID to user's request status
  const userRequestStatusMap: Record<string, string> = {};
  userRequests.forEach(request => {
    userRequestStatusMap[request.consultation.toString()] = request.status;
  });

  // Add rank_score, rank_level, and user's request status to each consultation
  data = data.map((consultation: any) => {
    const totalRakingScore =
      Math.round(consultation.creator?.ranking_score?.psychological || 0) +
      Math.round(consultation.creator?.ranking_score?.personality || 0) +
      Math.round(consultation.creator?.ranking_score?.experience || 0) +
      Math.round(consultation.creator?.ranking_score?.turnover || 0) +
      Math.round(consultation.creator?.ranking_score?.activity || 0);

    const userRequestStatus = userRequestStatusMap[consultation._id.toString()] || 'not_requested';

    return {
      ...consultation,
      creator: {
        ...consultation.creator,
        rank_score: Math.round(totalRakingScore),
        rank_level: userRank(Math.round(totalRakingScore) || 0),
      },
      userRequestStatus, // Add user's request status
    };
  });

  // remove unmatched (important)
  data = data.filter(item => item.company && item.creator);

  // Get accurate pagination info after filtering
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Get total count with same filters (without pagination)
  const countQuery = new QueryBuilder(
    Consultation.find({
      scheduledDate: { $gte: today },
    }),
    query,
  )
    .search(['title', 'name'])
    .filter([
      'company_name',
      'company_legal_name',
      'company_location',
      'company_website',
      'country',
      'vat_number',
      'company_id_number',
      'business_object',
      'business_types',
      'business_area',
      'experience',
      'positions',
      'annual_turnover',
    ]);

  // Apply same populate filters to count query
  const countCompanyMatch: any = {};
  companyFields.forEach(field => {
    if (query[field]) {
      if (Array.isArray(query[field])) {
        countCompanyMatch[field] = { $in: query[field] };
      } else if (typeof query[field] === 'string' && field.includes('name')) {
        countCompanyMatch[field] = { $regex: query[field], $options: 'i' };
      } else {
        countCompanyMatch[field] = query[field];
      }
    }
  });

  const countData = await countQuery.modelQuery
    .populate({
      path: 'company',
      match:
        Object.keys(countCompanyMatch).length > 0
          ? countCompanyMatch
          : undefined,
    })
    .populate({
      path: 'creator',
      match: { role },
    })
    .lean();

  const filteredCount = countData.filter(
    item => item.company && item.creator,
  ).length;

  const pagination = {
    total: filteredCount,
    page,
    limit,
    totalPages: Math.ceil(filteredCount / limit),
  };

  return {
    data,
    pagination,
  };
};

// const getBookingConsultations = async (
//   query: IConsultationFilters,
//   creatorId: string,
// ) => {
//   const today = dayjs().startOf('day').toDate();

//   const dateFilter =
//     query.type === 'upcoming'
//       ? { scheduledDate: { $gte: today } }
//       : query.type === 'completed'
//         ? { scheduledDate: { $lt: today } }
//         : {};

//   const myBooksConsultations = await ConsultationRequest.find({
//     request_user: creatorId,
//   }).select('consultation');
//   const baseFilter = {
//     _id: { $in: myBooksConsultations.map(c => c.consultation) },
//     ...dateFilter,
//   };

//   const consultationQuery = new QueryBuilder(
//     Consultation.find(baseFilter),
//     query,
//   )
//     .paginate()
//     .sort()
//     .filter(['type']);

//   const data = await consultationQuery.modelQuery
//     .populate('company', 'company_name company_website')
//     .populate('creator', 'name email image')
//     .lean();

//   if (!data.length) {
//     return {
//       data: [],
//       pagination: await consultationQuery.getPaginationInfo(),
//     };
//   }

//   const consultationIds = data.map(
//     (c: any) => new mongoose.Types.ObjectId(c._id),
//   );
//   const requestCounts = await ConsultationRequest.aggregate([
//     {
//       $match: {
//         consultation: { $in: consultationIds },
//       },
//     },
//     {
//       $group: {
//         _id: '$consultation',
//         approveToJoinCount: {
//           $sum: {
//             $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0],
//           },
//         },
//         pendingCount: {
//           $sum: {
//             $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
//           },
//         },
//       },
//     },
//   ]);

//   const requestCountMap: Record<string, any> = {};
//   requestCounts.forEach(item => {
//     requestCountMap[item._id.toString()] = {
//       approveToJoinCount: item.approveToJoinCount,
//       pendingCount: item.pendingCount,
//     };
//   });

//   const dataWithCounts = data.map((consultation: any) => ({
//     ...consultation,
//     requestCount: requestCountMap[consultation._id.toString()] || {
//       approveToJoinCount: 0,
//       pendingCount: 0,
//     },
//   }));

//   const pagination = await consultationQuery.getPaginationInfo();

//   return {
//     data: dataWithCounts,
//     pagination,
//   };
// };

const getBookingConsultations = async (
  query: IConsultationFilters,
  creatorId: string,
) => {
  const today = dayjs().startOf('day').toDate();

  // 📅 Date filter
  const dateFilter =
    query.type === 'upcoming'
      ? { scheduledDate: { $gte: today } }
      : query.type === 'completed'
        ? { scheduledDate: { $lt: today } }
        : {};

  // 🔎 Get booked consultations ids
  const myBooksConsultations = await ConsultationRequest.find({
    request_user: creatorId,
  }).select('consultation');

  const consultationIdsList = myBooksConsultations.map(c => c.consultation);

  // 🧱 Base filter
  const baseFilter = {
    _id: { $in: consultationIdsList },
    ...dateFilter,
  };

  // 🏗 Query Builder
  const consultationQuery = new QueryBuilder(
    Consultation.find(baseFilter),
    query,
  )
    .paginate()
    .sort()
    .filter(['type']);

  // 📦 Fetch data
  const data = await consultationQuery.modelQuery
    .populate('company', 'company_name company_website')
    .populate('creator', 'name email image')
    .lean();

  if (!data.length) {
    return {
      data: [],
      pagination: await consultationQuery.getPaginationInfo(),
    };
  }

  const consultationIds = data.map(
    (c: any) => new mongoose.Types.ObjectId(c._id),
  );

  // 📊 Aggregate counts
  const requestCounts = await ConsultationRequest.aggregate([
    {
      $match: {
        consultation: { $in: consultationIds },
      },
    },
    {
      $group: {
        _id: '$consultation',
        approveToJoinCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0],
          },
        },
        pendingCount: {
          $sum: {
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0],
          },
        },
      },
    },
  ]);

  // 🗺 Map counts
  const requestCountMap: Record<string, any> = {};
  requestCounts.forEach(item => {
    requestCountMap[item._id.toString()] = {
      approveToJoinCount: item.approveToJoinCount,
      pendingCount: item.pendingCount,
    };
  });

  // ✅ Get current user's request status
  const userRequests = await ConsultationRequest.find({
    consultation: { $in: consultationIds },
    request_user: creatorId,
  }).select('consultation status');

  const userRequestMap: Record<string, string> = {};
  userRequests.forEach(req => {
    userRequestMap[req.consultation.toString()] = req.status;
  });

  // 🔗 Merge everything
  const dataWithCounts = data.map((consultation: any) => ({
    ...consultation,
    requestCount: requestCountMap[consultation._id.toString()] || {
      approveToJoinCount: 0,
      pendingCount: 0,
    },
    myRequestStatus: userRequestMap[consultation._id.toString()] || null, // 🔥 important
  }));

  const pagination = await consultationQuery.getPaginationInfo();

  return {
    data: dataWithCounts,
    pagination,
  };
};
export const ConsultationService = {
  createConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByCompany,
  getConsultationsByCreator,
  updateConsultation,
  deleteConsultation,
  getUserBetterCallMe,
  getBookingConsultations,
};
