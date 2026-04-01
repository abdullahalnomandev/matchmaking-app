import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { MatchingService } from './matching.service';

const getTopMatches = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;
  const result = await MatchingService.getTopMatches(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Top matches fetched successfully',
    data: result,
  });
});

export const MatchingController = {
  getTopMatches,
};
