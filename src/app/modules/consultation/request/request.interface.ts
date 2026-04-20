import { Types } from 'mongoose';

export interface IConsultationRequest {
  _id?: Types.ObjectId;
  consultation: Types.ObjectId;
  request_user: Types.ObjectId;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateConsultationRequestPayload {
  consultation: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface IUpdateConsultationRequestPayload {
  status?: 'pending' | 'accepted' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface IConsultationRequestFilters {
  consultation?: string;
  request_user?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | '-createdAt' | 'priority' | '-priority';
  [key: string]: any;
}
