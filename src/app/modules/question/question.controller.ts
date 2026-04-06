import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { QuestionService } from './question.service';

const createQuestion = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.createQuestion(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question created successfully',
    data: result,
  });
});

const getAllQuestions = catchAsync(async (req: Request, res: Response) => {
  const { type } = req.query;
  const result = await QuestionService.getAllQuestions(type as any);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Questions retrieved successfully',
    data: result,
  });
});

const getQuestionsByCategory = catchAsync(async (req: Request, res: Response) => {
  const { categoryId } = req.params;
  const result = await QuestionService.getQuestionsByCategory(categoryId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Questions by category retrieved successfully',
    data: result,
  });
});

const getQuestionById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await QuestionService.getQuestionById(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question retrieved successfully',
    data: result,
  });
});

const updateQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await QuestionService.updateQuestion(id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question updated successfully',
    data: result,
  });
});

const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await QuestionService.deleteQuestion(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Question deleted successfully',
    data: result,
  });
});

const createPsychologicalTestQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.createPsychologicalTestQuestions(
    req.body?.answers || [],
    req.user?.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Psychological test questions created successfully',
    data: result,
  });
});

const createPersonalityTestQuestions = catchAsync(async (req: Request, res: Response) => {
  const result = await QuestionService.createPersonalityTestQuestions(
    req.body?.answers || [],
    req.user?.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Personality test questions created successfully',
    data: result,
  });
});

export const QuestionController = {
  createQuestion,
  getAllQuestions,
  getQuestionsByCategory,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  createPsychologicalTestQuestions,
  createPersonalityTestQuestions,
};
