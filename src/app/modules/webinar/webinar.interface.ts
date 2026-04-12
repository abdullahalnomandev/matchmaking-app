import { Types } from 'mongoose';
import { SUPPORT_AREA } from '../../../enums/business';

export interface IWebinar {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  creator: Types.ObjectId;
  supportArea: SUPPORT_AREA;
  type: 'LIVE' | 'RECORDING';
  
  // LIVE specific fields
  meetingUrl?: string;
  scheduledAt?: Date;
  durationMinutes?: number;
  
  // RECORDING specific fields
  videoUrl?: string;
  
  // SYSTEM STATUS
  status: 'scheduled' | 'live' | 'completed';
  
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
  status?: 'scheduled' | 'live' | 'completed';
  creator?: string;
  isPublished?: boolean;
  page?: number;
  limit?: number;
}
