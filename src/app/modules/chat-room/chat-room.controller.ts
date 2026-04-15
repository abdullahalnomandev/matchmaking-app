import { Request, Response } from 'express';
import { ChatRoomService } from './chat-room.service';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import { CHAT_ROOM_MESSAGES } from './chat-room.constant';

const createChatRoom = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.createChatRoomToDB(req.body, (req.user as any).id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: CHAT_ROOM_MESSAGES.CREATED_SUCCESSFULLY,
    data: result,
  });
});

const getAllChatRooms = catchAsync(async (req: Request, res: Response) => {
  const result = await ChatRoomService.getAllChatRoomsFromDB(req.query as Record<string, unknown>, req.user?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: CHAT_ROOM_MESSAGES.FOUND_SUCCESSFULLY,
    pagination: result.meta,
    data: result.data,
  });
});

const getChatRoomById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChatRoomService.getChatRoomByIdFromDB(id, req.user?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: CHAT_ROOM_MESSAGES.FOUND_SUCCESSFULLY,
    data: result,
  });
});

const updateChatRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChatRoomService.updateChatRoomInDB(id, req.body, req.user?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: CHAT_ROOM_MESSAGES.UPDATED_SUCCESSFULLY,
    data: result,
  });
});

const deleteChatRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  await ChatRoomService.deleteChatRoomFromDB(id, req.user?.id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: CHAT_ROOM_MESSAGES.DELETED_SUCCESSFULLY,
    data: null,
  });
});

const joinChatRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChatRoomService.joinChatRoom(id, (req.user as any).id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Joined chat room successfully',
    data: result,
  });
});

const leaveChatRoom = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ChatRoomService.leaveChatRoom(id, (req.user as any).id);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Left chat room successfully',
    data: result,
  });
});

const getChatRoomsBySupportArea = catchAsync(async (req: Request, res: Response) => {
  const { supportArea } = req.params;
  const result = await ChatRoomService.getChatRoomsBySupportArea(supportArea);
  
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: CHAT_ROOM_MESSAGES.FOUND_SUCCESSFULLY,
    data: result,
  });
});

export const ChatRoomController = {
  createChatRoom,
  getAllChatRooms,
  getChatRoomById,
  updateChatRoom,
  deleteChatRoom,
  joinChatRoom,
  leaveChatRoom,
  getChatRoomsBySupportArea,
};
