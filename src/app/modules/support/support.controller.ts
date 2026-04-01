import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SupportService } from './support.service';

const createSupportRequest = catchAsync(async (req: Request, res: Response) => {
  const { ...supportRequestData } = req.body;
  const requester = req.user._id;
  const result = await SupportService.createSupportRequest({ ...supportRequestData, requester });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Support request created successfully',
    data: result,
  });
});

const getAllSupportRequests = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportService.getAllSupportRequests(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support requests fetched successfully',
    data: result.result,
  });
});

const getSingleSupportRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportService.getSingleSupportRequest(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support request fetched successfully',
    data: result,
  });
});

const updateSupportRequest = catchAsync(async (req: Request, res: Response) => {
  const result = await SupportService.updateSupportRequest(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support request updated successfully',
    data: result,
  });
});

const acceptSupportRequest = catchAsync(async (req: Request, res: Response) => {
  const providerId = req.user._id;
  const result = await SupportService.acceptSupportRequest(req.params.id, providerId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Support request accepted successfully',
    data: result,
  });
});

export const SupportController = {
  createSupportRequest,
  getAllSupportRequests,
  getSingleSupportRequest,
  updateSupportRequest,
  acceptSupportRequest,
};
