import { Types } from 'mongoose';

export interface IConsultation {
  _id?: Types.ObjectId;
  name: string;
  title: string;
  company: Types.ObjectId;
  scheduledDate: Date;
  scheduleTime: string;
  durationMinutes: number;
  meetingLink: string;
  creator: Types.ObjectId;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateConsultationPayload {
  name: string;
  title: string;
  company: string;
  scheduledDate: Date;
  scheduleTime: string;
  durationMinutes: number;
  meetingLink: string;
}

export interface IUpdateConsultationPayload {
  name?: string;
  title?: string;
  scheduledDate?: Date;
  scheduleTime?: string;
  durationMinutes?: number;
  meetingLink?: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
}

export interface IConsultationFilters {
  company?: string;
  creator?: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS';
  dateFrom?: Date;
  dateTo?: Date;
  rank?: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';
  rank_level?: 'basic' | 'bronze' | 'silver' | 'gold' | 'platinum';
  page?: number;
  limit?: number;
  sortBy?: 'scheduledDate' | '-scheduledDate' | 'createdAt' | '-createdAt';
  [key: string]: any;
}
