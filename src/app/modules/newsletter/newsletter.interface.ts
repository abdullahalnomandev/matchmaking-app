import { Types } from 'mongoose';

export interface INewsletter {
  _id?: string;
  title: string;
  content: string;
  image?: string;
  createdBy: Types.ObjectId;
  area: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INewsletterFilters {
  search?: string;
  isActive?: boolean;
  createdBy?: string;
  page?: number;
  limit?: number;
}
