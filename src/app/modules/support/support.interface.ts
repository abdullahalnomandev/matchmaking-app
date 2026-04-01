import { Model, Types } from 'mongoose';
import { SUPPORT_AREA } from '../../../enums/business';

export interface ISupportRequest {
  _id: Types.ObjectId;
  requester: Types.ObjectId;
  provider?: Types.ObjectId;
  area: SUPPORT_AREA;
  description: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  mode: 'chat' | 'on_demand' | 'meeting';
  meeting_date?: Date;
}

export type SupportRequestModel = Model<ISupportRequest>;
