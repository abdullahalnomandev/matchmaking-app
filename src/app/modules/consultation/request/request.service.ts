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
  request_user: string,
) => {
  const consultationQuery = new QueryBuilder(
    ConsultationRequest.find({ request_user }),
    query,
  )
    .paginate()
    .sort()
    .filter();

  const data = await consultationQuery.modelQuery
    .populate('consultation')
    .lean();

  const pagination = await consultationQuery.getPaginationInfo();

  return { data, pagination };
};

// Get consultation request by ID
const getConsultationRequestById = async (requestId: string) => {
  return await ConsultationRequest.findById(requestId)
    .populate('consultation')
    .populate('request_user', 'name email image role');
};

// Update consultation request
const updateConsultationRequest = async (
  requestId: string,
  payload: IUpdateConsultationRequestPayload,
) => {
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
