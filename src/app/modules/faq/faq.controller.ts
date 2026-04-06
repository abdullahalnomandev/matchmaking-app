import { Request, Response } from 'express';
import { FaqService } from './faq.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';

const createFaq = catchAsync(async (req: Request, res: Response) => {
  const result = await FaqService.createFaqToDB(req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'FAQ created successfully',
    data: result,
  });
});

const getAllFaqs = catchAsync(async (req: Request, res: Response) => {
  const filters = {
    search: req.query.search as string,
    isActive: req.query.isActive === 'true' ? true : req.query.isActive === 'false' ? false : undefined,
    page: parseInt(req.query.page as string) || 1,
    limit: parseInt(req.query.limit as string) || 10
  };
  
  const result = await FaqService.getAllFaqsFromDB(filters);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQs retrieved successfully',
    data: result.data,
    pagination: result.meta,
  });
});

const getFaqById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqService.getFaqByIdFromDB(id);
  
  if (!result) {
    return sendResponse(res, {
      success: false,
      statusCode: StatusCodes.NOT_FOUND,
      message: 'FAQ not found',
      data: null,
    });
  }
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQ retrieved successfully',
    data: result,
  });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqService.updateFaqToDB(id, req.body);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQ updated successfully',
    data: result,
  });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await FaqService.deleteFaqFromDB(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQ deleted successfully',
    data: null,
  });
});

const toggleFaqStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await FaqService.toggleFaqStatus(id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'FAQ status toggled successfully',
    data: result,
  });
});

export const FaqController = {
  createFaq,
  getAllFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
  toggleFaqStatus
};
