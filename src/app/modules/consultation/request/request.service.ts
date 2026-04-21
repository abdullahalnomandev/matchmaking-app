import { ConsultationRequest } from './request.model';
import {
  ICreateConsultationRequestPayload,
  IUpdateConsultationRequestPayload,
  IConsultationRequestFilters,
} from './request.interface';
import { Types } from 'mongoose';
import QueryBuilder from '../../../builder/QueryBuilder';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../../errors/ApiError';
import { userRank } from '../../user/user.util';
import { Consultation } from '../consultation.model';

// Create consultation request
const createConsultationRequest = async (
  payload: ICreateConsultationRequestPayload,
  request_user: string,
) => {
  const isExist = await ConsultationRequest.findOne({
    request_user,
    consultation: payload.consultation,
  });
  if (isExist) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Consultation request already exists',
    );
  }
  return await ConsultationRequest.create({
    ...payload,
    request_user,
  });
};

// Get all consultation requests
const getConsultationRequests = async (query: IConsultationRequestFilters) => {
  const filterQuery = {};

  const consultationQuery = new QueryBuilder(
    ConsultationRequest.find(filterQuery),
    query,
  )
    .paginate()
    .sort()
    .filter();

  const data = await consultationQuery.modelQuery
    .populate('consultation')
    .populate('request_user', 'name email image role')
    .lean();

  const pagination = await consultationQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

// Get consultation requests by user
const getConsultationRequestsByUser = async (
  query: IConsultationRequestFilters,
  userId: string,
) => {
  const consultations = await Consultation.find({ creator: userId });
  const consultationQuery = new QueryBuilder(
    ConsultationRequest.find({
      consultation: { $in: consultations.map((c) => c._id) },
      status: 'pending',
    }),
    query,
  )
    .paginate()
    .sort()
    .filter();

  const data = await consultationQuery.modelQuery
    .populate({
      path: 'consultation',
      select: 'name title',
    })
    .populate({
      path: 'request_user',
      select: 'name email image role ranking_score',
      populate: {
        path: 'ranking_score',
        select: 'psychological personality experience turnover activity',
      },
    })
    .lean();

  const pagination = await consultationQuery.getPaginationInfo();

  return {
    data: data.map((item: any) => ({
      ...item,
      rank: userRank(
        Math.round(
          (item.request_user.ranking_score?.psychological || 0) +
            (item.request_user.ranking_score?.personality || 0) +
            (item.request_user.ranking_score?.experience || 0) +
            (item.request_user.ranking_score?.turnover || 0) +
            (item.request_user.ranking_score?.activity || 0)
        ) || 0
      ),
    })),
    pagination,
  };
};

// Get consultation request by ID
const getConsultationRequestById = async (requestId: string) => {
  return await ConsultationRequest.findById(requestId)
    .populate('consultation', 'name title')
    .populate({
      path: 'request_user',
      select: 'name email image role ranking_score',
      populate: {
        path: 'ranking_score',
        select: 'psychological personality experience turnover activity',
      },
    })
    .lean()
    .then((item: any) => {
      const totalRankingScore =
        (Math.round(item?.request_user?.ranking_score?.psychological || 0) +
          Math.round(item?.request_user?.ranking_score?.personality || 0) +
          Math.round(item?.request_user?.ranking_score?.experience || 0) +
          Math.round(item?.request_user?.ranking_score?.turnover || 0) +
          Math.round(item?.request_user?.ranking_score?.activity || 0));
      return {
        ...item,
        rank: userRank(Math.round(totalRankingScore) || 0),
      };
    });
};

// Update consultation request
const updateConsultationRequest = async (
  requestId: string,
  payload: IUpdateConsultationRequestPayload,
) => {
  console.log(requestId, payload);
  return await ConsultationRequest.findByIdAndUpdate(requestId, payload, {
    new: true,
    runValidators: true,
  })
    .populate('consultation')
    .populate('request_user', 'name email image role');
};

// Delete consultation request
const deleteConsultationRequest = async (requestId: string) => {
  return await ConsultationRequest.findByIdAndDelete(requestId);
};

// Check if request already exists
const checkExistingRequest = async (
  consultation: string,
  request_user: string,
) => {
  return await ConsultationRequest.findOne({
    consultation,
    request_user,
  });
};

export const ConsultationRequestService = {
  createConsultationRequest,
  getConsultationRequests,
  getConsultationRequestsByUser,
  getConsultationRequestById,
  updateConsultationRequest,
  deleteConsultationRequest,
  checkExistingRequest,
};
