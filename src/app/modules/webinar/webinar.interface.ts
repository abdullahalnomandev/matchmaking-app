import { Types } from 'mongoose';
import { SUPPORT_AREA } from '../../../enums/business';
import { WebinarStatus, WebinarType } from './webinar.constant';

export interface IWebinar {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  creator: Types.ObjectId;
  supportArea: SUPPORT_AREA;
  type: WebinarType;
  
  // LIVE specific fields
  meetingUrl?: string;
  scheduledAt?: Date;
  durationMinutes?: number;
  
  // RECORDING specific fields
  videoUrl?: string;
  
  // SYSTEM STATUS
  status: WebinarStatus;

  image?: string;
  
  // SETTINGS
  commentsEnabled: boolean;
  isPublished: boolean;
  
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IWebinarFilters {
  search?: string;
  supportArea?: string;
  type?: 'LIVE' | 'RECORDING';
  status?: 'upcoming' | 'recorded' | 'completed' | 'live';
  creator?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}
