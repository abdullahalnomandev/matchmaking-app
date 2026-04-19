import { Schema, model, Types } from 'mongoose';
import { IChatRoomMessage } from './chat-room-message.interface';

const chatRoomMessageSchema = new Schema<IChatRoomMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required']
    },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: [true, 'Chat room is required']
    },
    text: {
      type: String,
      trim: true,
      maxlength: [2000, 'Text cannot exceed 2000 characters']
    },
    image: {
      type: [String],
      validate: {
        validator: function(images: string[]) {
          return images.length <= 5; // Max 5 images per message
        },
        message: 'Maximum 5 images allowed per message'
      }
    }
  },
  { timestamps: true }
);

// Validation: At least one of text or image must be present
chatRoomMessageSchema.pre('save', function(next) {
  if (!this.text && (!this.image || this.image.length === 0)) {
    next(new Error('Message must have either text or at least one image'));
  } else {
    next();
  }
});

// Indexes for optimal queries
chatRoomMessageSchema.index({ chatRoom: 1, createdAt: -1 });
chatRoomMessageSchema.index({ sender: 1 });
chatRoomMessageSchema.index({ chatRoom: 1, sender: 1 });

export const ChatRoomMessage = model<IChatRoomMessage>('ChatRoomMessage', chatRoomMessageSchema);
