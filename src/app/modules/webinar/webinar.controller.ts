import { Request, Response } from 'express';
import { WebinarService } from './webinar.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createWebinar = catchAsync(async (req: Request, res: Response) => {
  // Add creator from authenticated user
  const image = getSingleFilePath(req.files, 'image');
  console.log('image', image);
  const payload: any = {
    ...req.body,
    creator: (req.user as any).id
  };

  if (image) {
    payload.image = image;
  }

  console.log('payload-', payload);
  const result = await WebinarService.createWebinarToDB(payload);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Webinar created successfully',
    data: result,
  });
});

const getAllWebinars = catchAsync(async (req: Request, res: Response) => {
  const result = await WebinarService.getAllWebinarsFromDB(req.query as Record<string, unknown>, req.user?.id || '');
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Webinars retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getUpcomingWebinars = catchAsync(async (req: Request, res: Response) => {
  const result = await WebinarService.getUpcomingWebinars(req.query as Record<string, unknown>, req.user?.id || '');
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Upcoming webinars retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getWebinarById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await WebinarService.getWebinarByIdFromDB(id);
  
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Webinar not found',
      data: null,
    });
  }
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Webinar retrieved successfully',
    data: result,
  });
});

const updateWebinar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const image = getSingleFilePath(req.files, 'image');
  const payload = {
    ...req.body,
    updatedBy: (req.user as any)._id
  };
  
  if (image) {
    payload.image = image;
  }
  
  const result = await WebinarService.updateWebinarToDB(id, payload);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Webinar updated successfully',
    data: result,
  });
});

const deleteWebinar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await WebinarService.deleteWebinarFromDB(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Webinar deleted successfully',
    data: null,
  });
});

const updateWebinarStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const result = await WebinarService.toggleWebinarStatus(id, status);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Webinar status updated successfully',
    data: result,
  });
});

const togglePublishStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const result = await WebinarService.toggleWebinarPublishStatus(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Webinar publish status toggled successfully',
    data: result,
  });
});

const toggleCommentsStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  
  const result = await WebinarService.toggleCommentsStatus(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Comments status toggled successfully',
    data: result,
  });
});

export const WebinarController = {
  createWebinar,
  getAllWebinars,
  getUpcomingWebinars,
  getWebinarById,
  updateWebinar,
  deleteWebinar,
  updateWebinarStatus,
  togglePublishStatus,
  toggleCommentsStatus,
};
