import { Request, Response } from 'express';
import { WebinarLikeService } from './webinar-like.service';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';

const toggleCommentLike = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { commentId } = req.params;
  
  const result = await WebinarLikeService.toggleCommentLike({
    comment: commentId as string,
    user: user.id
  });
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: result.message,
    data: result,
  });
});

export const WebinarLikeController = {
  toggleCommentLike
};
