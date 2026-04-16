import QueryBuilder from '../../builder/QueryBuilder';
import { IChatRoom, IChatRoomFilters, ICreateChatRoomPayload, IUpdateChatRoomPayload } from './chat-room.interface';
import {  ChatRoom } from './chat-room.model';
import { CHAT_ROOM_MESSAGES } from './chat-room.constant';
import { SUPPORT_TO_BUSINESS_MAP } from '../../../enums/business';
import { Company } from '../company/company.model';

const createChatRoomToDB = async (payload: ICreateChatRoomPayload, creatorId: string): Promise<IChatRoom> => {
  // Check if chat room with same name already exists
  const existingChatRoom = await ChatRoom.findOne({ supportArea: payload.supportArea });
  if (existingChatRoom) {
    throw new Error(CHAT_ROOM_MESSAGES.ALREADY_EXISTS);
  }


  const chatRoomPayload = {
    ...payload,
    creator: creatorId,
    isActive: payload.isActive ?? true
  };

  const chatRoom = await ChatRoom.create(chatRoomPayload);
  return chatRoom;
};

const getAllChatRoomsFromDB = async (
  query: Record<string, unknown>,
  userId: string
): Promise<{ data: IChatRoom[]; meta: any }> => {
  const companies = await Company.find({ owner: userId }, 'business_area');
  
  const filterArea: string[] = [];

  for (const company of companies) {
    if (!company.business_area) {
      continue; // Skip if no business area
    }
    
    const businessArea = company.business_area;
    
    console.log('businessArea',businessArea)
    // Find all support areas that are relevant to this business area
    for (const [supportArea, businessAreas] of Object.entries(SUPPORT_TO_BUSINESS_MAP)) {
      if (businessAreas.includes(businessArea)) {
        filterArea.push(supportArea);
      }
    }
  }

  // Set default filter for active chat rooms
  query.isActive = true;

  const queryBuilder = new QueryBuilder(
    ChatRoom.find({ supportArea: { $in: filterArea } }),
    query,
  )
    .search(['name', 'description'])
    .filter()
    .paginate()
    .sort()
    .fields();

  const [data, meta] = await Promise.all([
    queryBuilder.modelQuery
      .populate('creator', 'name email'),
    queryBuilder.getPaginationInfo(),
  ]);

  return { data, meta };
};

const getChatRoomByIdFromDB = async (id: string, userId?: string): Promise<IChatRoom | null> => {
  const chatRoom = await ChatRoom.findById(id)
    .populate('creator', 'name email')
    .populate('lastMessage.sender', 'name email');

  if (!chatRoom) {
    throw new Error(CHAT_ROOM_MESSAGES.NOT_FOUND);
  }

  return chatRoom;
};

const updateChatRoomInDB = async (
  id: string,
  payload: IUpdateChatRoomPayload,
  userId?: string
): Promise<IChatRoom | null> => {
  const chatRoom = await ChatRoom.findById(id);
  
  if (!chatRoom) {
    throw new Error(CHAT_ROOM_MESSAGES.NOT_FOUND);
  }

  // Check if user is the creator or has permission to update
  if (userId && chatRoom.creator?.toString() !== userId) {
    throw new Error(CHAT_ROOM_MESSAGES.ACCESS_DENIED);
  }

  // If updating name, check for duplicates
  if (payload.name && payload.name !== chatRoom.name) {
    const existingChatRoom = await ChatRoom.findOne({ name: payload.name });
    if (existingChatRoom) {
      throw new Error(CHAT_ROOM_MESSAGES.ALREADY_EXISTS);
    }
  }

  const updatedChatRoom = await ChatRoom.findByIdAndUpdate(
    id,
    payload,
    { new: true, runValidators: true }
  )
    .populate('creator', 'name email');

  return updatedChatRoom;
};

const deleteChatRoomFromDB = async (id: string, userId?: string): Promise<void> => {
  const chatRoom = await ChatRoom.findById(id);
  
  if (!chatRoom) {
    throw new Error(CHAT_ROOM_MESSAGES.NOT_FOUND);
  }

  // Check if user is the creator or has permission to delete
  if (userId && chatRoom.creator?.toString() !== userId) {
    throw new Error(CHAT_ROOM_MESSAGES.ACCESS_DENIED);
  }

  await ChatRoom.findByIdAndDelete(id);
};

const joinChatRoom = async (chatRoomId: string, userId: string): Promise<IChatRoom | null> => {
  const chatRoom = await ChatRoom.findById(chatRoomId);
  
  if (!chatRoom) {
    throw new Error(CHAT_ROOM_MESSAGES.NOT_FOUND);
  }

  if (!chatRoom.isActive) {
    throw new Error('Cannot join inactive chat room');
  }

  // Add user to participants
  const updatedChatRoom = await ChatRoom.findByIdAndUpdate(
    chatRoomId,
    { $addToSet: { participants: userId } },
    { new: true }
  )
    .populate('creator', 'name email');

  return updatedChatRoom;
};

const leaveChatRoom = async (chatRoomId: string, userId: string): Promise<IChatRoom | null> => {
  const chatRoom = await ChatRoom.findById(chatRoomId);
  
  if (!chatRoom) {
    throw new Error(CHAT_ROOM_MESSAGES.NOT_FOUND);
  }

  // Remove user from participants
  const updatedChatRoom = await ChatRoom.findByIdAndUpdate(
    chatRoomId,
    { $pull: { participants: userId } },
    { new: true }
  )
    .populate('creator', 'name email');

  return updatedChatRoom;
};

const getChatRoomsBySupportArea = async (supportArea: string): Promise<IChatRoom[]> => {
  const chatRooms = await ChatRoom.find({ 
    supportArea, 
    isActive: true 
  })
    .populate('creator', 'name email')
    .sort({ createdAt: -1 });

  return chatRooms;
};

export const ChatRoomService = {
  createChatRoomToDB,
  getAllChatRoomsFromDB,
  getChatRoomByIdFromDB,
  updateChatRoomInDB,
  deleteChatRoomFromDB,
  joinChatRoom,
  leaveChatRoom,
  getChatRoomsBySupportArea
};
