import { Types } from 'mongoose';

export interface IWebinarLike {
  _id?: Types.ObjectId;
  comment: Types.ObjectId;
  user: Types.ObjectId;
  createdAt?: Date;
}

export interface ICreateCommentLikePayload {
  comment: string;
  user: string;
}
