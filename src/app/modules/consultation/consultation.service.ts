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
    .select('scheduledDate company creator') 
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

const getUserBetterCallMe = async (query: IConsultationFilters) => {
  console.log(query);
  const today = dayjs().startOf('day').toDate();
  const role = query?.role || USER_ROLES.BUSINESS_USER;

  // ✅ build query
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
      match: { role }, // 👈 filter by creator.role
      select: 'name email image role ranking_score',
    });

  // ✅ execute query
  let data = await consultationQuery.modelQuery.lean();

  // Add rank_score and rank_level to each consultation
  data = data.map((consultation: any) => {
    const totalRakingScore = 
      (Math.round(consultation.creator?.ranking_score?.psychological || 0) +
      Math.round(consultation.creator?.ranking_score?.personality || 0) +
      Math.round(consultation.creator?.ranking_score?.experience || 0) +
      Math.round(consultation.creator?.ranking_score?.turnover || 0) +
      Math.round(consultation.creator?.ranking_score?.activity || 0));
    
    return {
      ...consultation,
      creator: {
        ...consultation.creator,
        rank_score: Math.round(totalRakingScore),
        rank_level: userRank(Math.round(totalRakingScore) || 0),
      },
    };
  });

  // ❗ remove unmatched (important)
  data = data.filter(item => item.company && item.creator);

  // ✅ Get accurate pagination info after filtering
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
      'annual_turnover'
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
      match: Object.keys(countCompanyMatch).length > 0 ? countCompanyMatch : undefined,
    })
    .populate({
      path: 'creator',
      match: { role },
    })
    .lean();

  const filteredCount = countData.filter(item => item.company && item.creator).length;

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

export const ConsultationService = {
  createConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByCompany,
  getConsultationsByCreator,
  updateConsultation,
  deleteConsultation,
  getUserBetterCallMe
};
