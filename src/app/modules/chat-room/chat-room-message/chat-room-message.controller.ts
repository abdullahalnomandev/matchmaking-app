import { Request, Response } from 'express';
import { ChatRoomMessageService } from './chat-room-message.service';
import sendResponse from '../../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../../shared/catchAsync';
import { getMultipleFilesPath } from '../../../../shared/getFilePath';

const createMessage = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const image = getMultipleFilesPath(req.files, 'image');
  const payload = {
    ...req.body,
    sender: user.id,
    image
  };

  
  const result = await ChatRoomMessageService.createMessage(payload);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Message created successfully',
    data: result,
  });
});

const getMessagesByChatRoom = catchAsync(async (req: Request, res: Response) => {
  const { chatRoomId } = req.params;
  const result = await ChatRoomMessageService.getMessagesByChatRoom(req.query, chatRoomId as string);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Messages retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

const getMessagesBySender = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const result = await ChatRoomMessageService.getMessagesBySender(req.query, user.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Messages retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
});

const deleteMessage = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { messageId } = req.params;
  
  const result = await ChatRoomMessageService.deleteMessage(messageId as string, user.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Message deleted successfully',
    data: result,
  });
});

export const ChatRoomMessageController = {
  createMessage,
  getMessagesByChatRoom,
  getMessagesBySender,
  deleteMessage
};
