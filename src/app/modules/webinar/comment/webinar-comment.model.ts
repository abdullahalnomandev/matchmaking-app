import { Schema, model, Types } from 'mongoose';
import { IWebinarComment } from './webnar.comment';

const webinarCommentSchema = new Schema<IWebinarComment>(
  {
    webinar: {
      type: Schema.Types.ObjectId,
      ref: 'Webinar',
      required: [true, 'Webinar reference is required']
    },
    comment: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    }
  },
  { timestamps: true }
);

// Indexes for optimal queries
webinarCommentSchema.index({ webinar: 1, createdAt: -1 });
webinarCommentSchema.index({ user: 1 });

export const WebinarComment = model<IWebinarComment>('WebinarComment', webinarCommentSchema);
