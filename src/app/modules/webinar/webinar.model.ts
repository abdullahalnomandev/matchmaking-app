import { Schema, model, Types } from 'mongoose';
import { IWebinar } from './webinar.interface';
import { WebinarStatus } from './webinar.constant';

const webinarSchema = new Schema<IWebinar>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    image: {
      type: String
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    supportArea: {
      type: String,
      required: [true, 'Support area is required'],
      enum: {
        values: [
          'company_creation_and_structuring',
          'legal_advisory',
          'contract_law',
          'corporate_governance',
          'financial_advisory',
          'accounting_and_tax',
          'm_and_a_partnerships',
          'fundraising_and_investment',
          'hr_and_recruitment',
          'payroll_and_compliance',
          'operations_and_process_optimization',
          'supply_chain_management',
          'it_and_cybersecurity',
          'digital_transformation',
          'ai_and_automation',
          'marketing_and_sales_strategy',
          'branding_and_positioning',
          'international_expansion',
          'risk_management',
          'crisis_management',
          'esg_and_sustainability'
        ],
        message: 'Invalid support area'
      }
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: {
        values: ['LIVE', 'RECORDING'],
        message: 'Type must be either LIVE or RECORDING'
      }
    },
    // LIVE specific fields
    meetingUrl: {
      type: String,
      validate: {
        validator: function(this: IWebinar, value: string) {
          // Only validate meetingUrl if type is LIVE
          return this.type === 'LIVE' ? !!value : true;
        },
        message: 'Meeting URL is required for LIVE webinars'
      }
    },
    scheduledAt: {
      type: Date,
      validate: {
        validator: function(this: IWebinar, value: Date) {
          // Only validate scheduledAt if type is LIVE
          return this.type === 'LIVE' ? !!value : true;
        },
        message: 'Scheduled date is required for LIVE webinars'
      }
    },
    durationMinutes: {
      type: Number,
      min: [1, 'Duration must be at least 1 minute'],
      max: [480, 'Duration cannot exceed 8 hours']
    },
    // RECORDING specific fields
    videoUrl: {
      type: String,
      validate: {
        validator: function(this: IWebinar, value: string) {
          // Only validate videoUrl if type is RECORDING
          return this.type === 'RECORDING' ? !!value : true;
        },
        message: 'Video URL is required for RECORDING webinars'
      }
    },
    // SYSTEM STATUS
    status: {
      type: String,
      enum: {
        values: Object.values(WebinarStatus),
        message: 'Status must be recorded, upcoming, completed, or live'
      }
    },
    // SETTINGS
    commentsEnabled: {
      type: Boolean,
      default: true
    },
    isPublished: {
      type: Boolean,
      default: true
    }
    
  },
  { timestamps: true }
);

// Indexes for search functionality
webinarSchema.index({ title: 'text', description: 'text' });
webinarSchema.index({ creator: 1 });
webinarSchema.index({ supportArea: 1 });
webinarSchema.index({ type: 1 });
webinarSchema.index({ status: 1 });
webinarSchema.index({ isPublished: 1 });
webinarSchema.index({ scheduledAt: 1 });
webinarSchema.index({ createdAt: -1 });

// Compound indexes for common queries
webinarSchema.index({ supportArea: 1, status: 1 });
webinarSchema.index({ type: 1, status: 1 });
webinarSchema.index({ creator: 1, status: 1 });

export const Webinar = model<IWebinar>('Webinar', webinarSchema);
