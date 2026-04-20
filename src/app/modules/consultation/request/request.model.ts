import { Schema, model, Types } from 'mongoose';
import { IConsultationRequest } from './request.interface';

const consultationRequestSchema = new Schema<IConsultationRequest>(
  {
    consultation: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      required: [true, 'Consultation is required']
    },
    request_user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Request user is required']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      required: [true, 'Priority is required'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// Indexes for optimal queries
consultationRequestSchema.index({ consultation: 1, createdAt: -1 });
consultationRequestSchema.index({ request_user: 1, createdAt: -1 });
consultationRequestSchema.index({ status: 1, priority: -1, createdAt: -1 });
consultationRequestSchema.index({ consultation: 1, status: 1 });
consultationRequestSchema.index({ request_user: 1, status: 1 });

// Compound indexes for common queries
consultationRequestSchema.index({ consultation: 1, request_user: 1 });
consultationRequestSchema.index({ status: 1, priority: -1 });

export const ConsultationRequest = model<IConsultationRequest>('ConsultationRequest', consultationRequestSchema);
