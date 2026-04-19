import { Schema, model, Types } from 'mongoose';
import { IWebinarLike } from './webinar-like.interface';

const webinarLikeSchema = new Schema<IWebinarLike>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'WebinarComment',
      required: [true, 'Comment reference is required']
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required']
    }
  },
  { timestamps: true }
);

// Indexes for optimal queries and to prevent duplicate likes
webinarLikeSchema.index({ user: 1 });
webinarLikeSchema.index({ comment: 1 });
webinarLikeSchema.index({ comment: 1, user: 1 }, { unique: true, sparse: true });

export const WebinarLike = model<IWebinarLike>('WebinarLike', webinarLikeSchema);
