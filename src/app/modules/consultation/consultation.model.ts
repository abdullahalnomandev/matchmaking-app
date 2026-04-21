import { Schema, model, Types } from 'mongoose';
import { IConsultation } from './consultation.interface';

const consultationSchema = new Schema<IConsultation>(
  {
    name:{
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company is required']
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required'],
      validate: {
        validator: function(value: Date) {
          return value > new Date();
        },
        message: 'Scheduled date must be in the future'
      }
    },
    scheduleTime:{
      type: String,
      required: [true, 'Schedule time is required'],
      trim: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Duration must be at least 15 minutes'],
      max: [480, 'Duration cannot exceed 8 hours (480 minutes)']
    },
    meetingLink: {
      type: String,
      required: [true, 'Meeting link is required'],
      trim: true,
      validate: {
        validator: function(value: string) {
          // Basic URL validation for common meeting platforms
          const urlPattern = /^https?:\/\/.+/;
          return urlPattern.test(value);
        },
        message: 'Meeting link must be a valid URL'
      }
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'IN_PROGRESS'],
      default: 'SCHEDULED'
    }
  },
  { timestamps: true }
);

// Indexes for optimal queries
consultationSchema.index({ company: 1, scheduledDate: -1 });
consultationSchema.index({ creator: 1, scheduledDate: -1 });
consultationSchema.index({ status: 1, scheduledDate: -1 });
consultationSchema.index({ scheduledDate: -1 });
consultationSchema.index({ createdAt: -1 });

// Compound indexes for common queries
consultationSchema.index({ company: 1, status: 1 });
consultationSchema.index({ creator: 1, status: 1 });

export const Consultation = model<IConsultation>('Consultation', consultationSchema);
