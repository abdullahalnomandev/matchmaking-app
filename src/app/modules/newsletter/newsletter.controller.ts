import { Request, Response } from 'express';
import { NewsletterService } from './newsletter.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { getSingleFilePath } from '../../../shared/getFilePath';

const createNewsletter = catchAsync(async (req: Request, res: Response) => {
  // Add createdBy from authenticated user
  const payload = {
    ...req.body,
    createdBy : (req.user as any).id
  };
  let image = getSingleFilePath(req.files, 'image');
  if (image) {
    payload.image = image;
    payload.createdBy = (req.user as any).id;
  }
  
  const result = await NewsletterService.createNewsletterToDB(payload);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Newsletter created successfully',
    data: result,
  });
});

const getAllNewsletters = catchAsync(async (req: Request, res: Response) => {

  const result = await NewsletterService.getAllNewslettersFromDB(req.query as Record<string, unknown>, req.user?.id || '',req.user?.role || '');
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Newsletters retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getNewsletterById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NewsletterService.getNewsletterByIdFromDB(id);
  
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'Newsletter not found',
      data: null,
    });
  }
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Newsletter retrieved successfully',
    data: result,
  });
});

const updateNewsletter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = {
    ...req.body,
    updatedBy: (req.user as any).id
  };
  let image = getSingleFilePath(req.files, 'image');
  if (image) {
    payload.image = image;
  }
  const result = await NewsletterService.updateNewsletterToDB(id, payload);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Newsletter updated successfully',
    data: result,
  });
});

const deleteNewsletter = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await NewsletterService.deleteNewsletterFromDB(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Newsletter deleted successfully',
    data: null,
  });
});

const toggleNewsletterStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await NewsletterService.toggleNewsletterStatus(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Newsletter status toggled successfully',
    data: result,
  });
});

export const NewsletterController = {
  createNewsletter,
  getAllNewsletters,
  getNewsletterById,
  updateNewsletter,
  deleteNewsletter,
  toggleNewsletterStatus
};
