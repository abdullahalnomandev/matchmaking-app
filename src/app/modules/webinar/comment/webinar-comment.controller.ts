import { Request, Response } from 'express';
import { WebinarCommentService } from './webinar-comment.service';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';

const createComment = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { webinar, comment } = req.body;
  
  const result = await WebinarCommentService.createComment({
    webinar,
    comment,
    user: user.id
  });
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Comment created successfully',
    data: result,
  });
});

const getCommentsByWebinar = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const result = await WebinarCommentService.getCommentsByWebinar(req.query, id, userId);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Comments retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

const updateComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  const { comment } = req.body;
  
  const result = await WebinarCommentService.updateComment(id, user.id, { comment });
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Comment updated successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = (req as any).user;
  
  const result = await WebinarCommentService.deleteComment(id, user.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Comment deleted successfully',
    data: result,
  });
});

export const WebinarCommentController = {
  createComment,
  getCommentsByWebinar,
  updateComment,
  deleteComment
};
