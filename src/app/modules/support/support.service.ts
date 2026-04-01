import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ISupportRequest } from './support.interface';
import { SupportRequest } from './support.model';
import QueryBuilder from '../../builder/QueryBuilder';

const createSupportRequest = async (payload: ISupportRequest): Promise<ISupportRequest> => {
  return await SupportRequest.create(payload);
};

const getAllSupportRequests = async (query: Record<string, unknown>) => {
  const supportRequestQuery = new QueryBuilder(SupportRequest.find().populate('requester').populate('provider'), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await supportRequestQuery.modelQuery;
  const meta = await supportRequestQuery.modelQuery.countDocuments();

  return {
    meta,
    result,
  };
};

const getSingleSupportRequest = async (id: string): Promise<ISupportRequest | null> => {
  return await SupportRequest.findById(id).populate('requester').populate('provider');
};

const updateSupportRequest = async (id: string, payload: Partial<ISupportRequest>): Promise<ISupportRequest | null> => {
  const isExist = await SupportRequest.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support request not found');
  }

  return await SupportRequest.findByIdAndUpdate(id, payload, { new: true });
};

const acceptSupportRequest = async (id: string, providerId: string): Promise<ISupportRequest | null> => {
  const isExist = await SupportRequest.findById(id);
  if (!isExist) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Support request not found');
  }

  return await SupportRequest.findByIdAndUpdate(id, { 
    provider: providerId,
    status: 'accepted'
  }, { new: true });
};

export const SupportService = {
  createSupportRequest,
  getAllSupportRequests,
  getSingleSupportRequest,
  updateSupportRequest,
  acceptSupportRequest,
};
