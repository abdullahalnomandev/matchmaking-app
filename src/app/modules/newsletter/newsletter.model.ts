import { Schema, model, Types } from 'mongoose';
import { INewsletter } from './newsletter.interface';

const newsletterSchema = new Schema<INewsletter>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [5000, 'Content cannot exceed 5000 characters']
    },
    image: {
      type: String,
      default: null
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true },

);

// Index for search functionality
newsletterSchema.index({ title: 'text', content: 'text' });
newsletterSchema.index({ createdBy: 1 });
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ createdAt: -1 });

export const Newsletter = model<INewsletter>('Newsletter', newsletterSchema);
