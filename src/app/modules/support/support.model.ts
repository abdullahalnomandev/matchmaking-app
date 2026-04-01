import { model, Schema } from 'mongoose';
import { SUPPORT_AREA } from '../../../enums/business';
import { ISupportRequest, SupportRequestModel } from './support.interface';

const supportRequestSchema = new Schema<ISupportRequest, SupportRequestModel>(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    area: {
      type: String,
      enum: Object.values(SUPPORT_AREA),
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    mode: {
      type: String,
      enum: ['chat', 'on_demand', 'meeting'],
      required: true,
    },
    meeting_date: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const SupportRequest = model<ISupportRequest, SupportRequestModel>('SupportRequest', supportRequestSchema);
