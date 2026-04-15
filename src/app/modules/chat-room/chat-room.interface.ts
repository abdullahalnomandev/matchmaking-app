import { Types } from 'mongoose';
import { SUPPORT_AREA } from '../../../enums/business';

export interface IChatRoom {
  _id?: Types.ObjectId;
  name: string;
  supportArea: SUPPORT_AREA;
  description: string;
  isActive: boolean;
  creator?: Types.ObjectId;
  participants?: Types.ObjectId[];
  lastMessage?: {
    content: string;
    sender: Types.ObjectId;
    timestamp: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatRoomFilters {
  search?: string;
  supportArea?: string;
  isActive?: boolean;
  creator?: string;
  page?: number;
  limit?: number;
}

export interface ICreateChatRoomPayload {
  name: string;
  supportArea: SUPPORT_AREA;
  description: string;
  isActive?: boolean;
}

export interface IUpdateChatRoomPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}
