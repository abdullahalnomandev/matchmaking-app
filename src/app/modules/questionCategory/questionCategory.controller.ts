import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { QuestionCategoryService } from './questionCategory.service';

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionCategoryService.createCategory(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question category created successfully',
    data: result,
  });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;
  const result = await QuestionCategoryService.getAllCategories(type as any);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question categories retrieved successfully',
    data: result,
  });
});

const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await QuestionCategoryService.getCategoryById(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question category retrieved successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await QuestionCategoryService.updateCategory(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await QuestionCategoryService.deleteCategory(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question category deleted successfully',
    data: result,
  });
});

export const QuestionCategoryController = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
