import QueryBuilder from '../../builder/QueryBuilder';
import { Consultation } from './consultation.model';
import { Company } from '../company/company.model';
import { ICreateConsultationPayload, IUpdateConsultationPayload, IConsultationFilters } from './consultation.interface';
import dayjs from 'dayjs';
import { USER_ROLES } from '../../../enums/user';

const createConsultation = async (payload: ICreateConsultationPayload, creatorId: string): Promise<any> => {
  // Check if company exists
  const company = await Company.findOne({owner:creatorId, _id:payload.company});
  if (!company) {
    throw new Error('You are not authorized to create consultation for this company');
  }

  const consultationPayload = {
    ...payload,
    creator: creatorId,
  };

  console.log(consultationPayload)
  const consultation = await Consultation.create(consultationPayload);
  
  // Populate company and creator info
    await consultation.populate([
      { path: 'company', select: 'company_name company_website' },
      { path: 'creator', select: 'name email image' }
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
    query
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
  companyId: string
) => {
  // Check if company exists
  const company = await Company.findOne({_id:companyId});
  if (!company) {
    throw new Error('Company not found');
  }
  
  const consultationQuery = new QueryBuilder(
    Consultation.find({ company: companyId }),
    query
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

const getConsultationsByCreator = async (query: IConsultationFilters, creatorId: string) => {
  console.log('CREATOR', creatorId);
  
  const today = dayjs().startOf('day').toDate();
  const dateFilter = query.type === 'upcoming'   ? { scheduledDate: { $gte: today } } : query.type === 'completed'  ? { scheduledDate: { $lt: today } } : {};
  
  const consultationQuery = new QueryBuilder(
    Consultation.find({ creator: creatorId, ...dateFilter }),
    query
  ).paginate().sort().filter(['type']);

  const data = await consultationQuery.modelQuery
    .populate('company', 'company_name company_website')
    .populate('creator', 'name email image')
    .lean();

  const pagination = await consultationQuery.getPaginationInfo();

  return { data, pagination };
};

const updateConsultation = async (
  consultationId: string,
  userId: string,
  payload: IUpdateConsultationPayload
) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    creator: userId
  });

  if (!consultation) {
    throw new Error('Consultation not found or you are not authorized to update it');
  }

  // Prevent updating completed or cancelled consultations
  if (consultation.status === 'COMPLETED' || consultation.status === 'CANCELLED') {
    throw new Error('Cannot update completed or cancelled consultations');
  }

  const updatedConsultation = await Consultation.findByIdAndUpdate(
    consultationId,
    payload,
    { new: true, runValidators: true }
  ).populate([
    { path: 'company', select: 'company_name company_website' },
    { path: 'creator', select: 'name email image' }
  ]);

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(`consultation_updated::${consultation.company}`, updatedConsultation);
    io.emit(`consultation_update::${consultation.company}`, {
      type: 'updated',
      data: updatedConsultation
    });
  }

  return updatedConsultation;
};

const deleteConsultation = async (consultationId: string, userId: string) => {
  const consultation = await Consultation.findOne({
    _id: consultationId,
    creator: userId
  });

  if (!consultation) {
    throw new Error('Consultation not found or you are not authorized to delete it');
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
      companyId: consultation.company
    });
    io.emit(`consultation_update::${consultation.company}`, {
      type: 'deleted',
      data: { consultationId: consultation._id }
    });
  }

  return consultation;
};

export const ConsultationService = {
  createConsultation,
  getConsultations,
  getConsultationById,
  getConsultationsByCompany,
  getConsultationsByCreator,
  updateConsultation,
  deleteConsultation
};
