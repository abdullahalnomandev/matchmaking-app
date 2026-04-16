import { Types } from 'mongoose';

export interface IWebinarComment {
  _id?: Types.ObjectId;
  webinar: Types.ObjectId;
  comment: string;
  user: Types.ObjectId;
  likes?: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}