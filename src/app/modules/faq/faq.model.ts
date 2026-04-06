import { Schema, model } from 'mongoose';
import { IFaq } from './faq.interface';

const faqSchema = new Schema<IFaq>(
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
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Index for search functionality
faqSchema.index({ title: 'text', description: 'text' });

export const Faq = model<IFaq>('Faq', faqSchema);
