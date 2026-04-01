import { model, Schema } from 'mongoose';
import { IConversation, IConversationModel } from './conversation.interface';

const conversationSchema = new Schema<IConversation, IConversationModel>(
    {
        creator: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        participant: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        lastMessage: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
        },
    },
    { timestamps: true }
);

export const Conversation = model<IConversation, IConversationModel>('Conversation', conversationSchema);