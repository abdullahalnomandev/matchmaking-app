import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ConversationService } from './conversation.service';

const createConversation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const creator = req?.user?.id;
    const { participant, text } = req.body;
    const result = await ConversationService.createConversation({ creator, participant, text });

    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'conversation created successfully',
      data: result,
    });
  }
);

const getAllConversaions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {

  const creator = req?.user?.id;
  const result = await ConversationService.getAllConversaions(req.query, creator);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'conversations fetch successfully',
    data: result,
  });
}
);


const deleteConversation = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const creator = req?.user?.id;
  const id = req.params.id;
  const result = await ConversationService.deleteConversation(id, creator);
  sendResponse(res, {
      success: true,
      statusCode: StatusCodes.CREATED,
      message: 'conversation deleted successfully',
      data: result,
    });
}
);



export const ConversationController = {
  createConversation,
  getAllConversaions,
  deleteConversation

};