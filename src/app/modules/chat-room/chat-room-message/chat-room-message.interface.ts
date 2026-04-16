import { Types } from 'mongoose';

export interface IChatRoomMessage {
  _id?: Types.ObjectId;
  sender: Types.ObjectId;
  chatRoom: Types.ObjectId;
  text?: string;
  image?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateChatRoomMessagePayload {
  chatRoom: string;
  sender: string;
  text?: string;
  image?: string[];
}

export interface IChatRoomMessageFilters {
  chatRoom?: string;
  sender?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | '-createdAt';
  [key: string]: any;
}
