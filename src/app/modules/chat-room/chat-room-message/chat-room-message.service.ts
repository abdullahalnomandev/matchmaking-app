import QueryBuilder from '../../../builder/QueryBuilder';
import { ChatRoomMessage } from './chat-room-message.model';
import { ChatRoom } from '../chat-room.model';
import { ICreateChatRoomMessagePayload, IChatRoomMessageFilters } from './chat-room-message.interface';

const createMessage = async (payload: ICreateChatRoomMessagePayload): Promise<any> => {
  // Check if chat room exists and is active
  const chatRoom = await ChatRoom.findById(payload.chatRoom);
  if (!chatRoom) {
    throw new Error('Chat room not found');
  }
  if (!chatRoom.isActive) {
    throw new Error('Cannot send message to inactive chat room');
  }

  const message = await ChatRoomMessage.create(payload);
  
  // Populate sender and chat room info
  await message.populate([
    { path: 'sender', select: 'name email image' },
    { path: 'chatRoom', select: 'name description' }
  ]);

  // Update chat room's last message
  await ChatRoom.findByIdAndUpdate(
    payload.chatRoom,
    {
      lastMessage: {
        content: payload.text || 'Image message',
        sender: payload.sender,
        timestamp: new Date()
      }
    },
    { new: true }
  );

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(`chat_room_message::${payload.chatRoom}`, message);
  }

  return message;
};

const getMessagesByChatRoom = async (
  query: IChatRoomMessageFilters,
  chatRoomId: string
) => {
  const messageQuery = new QueryBuilder(
    ChatRoomMessage.find({ chatRoom: chatRoomId }),
    query
  )
    .paginate()
    .sort()
    .filter();

  const data = await messageQuery.modelQuery
    .populate('sender', 'name email image')
    .populate('chatRoom', 'name description')
    .lean();

  const pagination = await messageQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

const getMessagesBySender = async (
  query: IChatRoomMessageFilters,
  senderId: string
) => {
  const messageQuery = new QueryBuilder(
    ChatRoomMessage.find({ sender: senderId }),
    query
  )
    .paginate()
    .sort()
    .filter();

  const data = await messageQuery.modelQuery
    .populate('sender', 'name email image')
    .populate('chatRoom', 'name description')
    .lean();

  const pagination = await messageQuery.getPaginationInfo();

  return {
    data,
    pagination,
  };
};

const deleteMessage = async (messageId: string, userId: string) => {
  const message = await ChatRoomMessage.findOne({
    _id: messageId,
    sender: userId
  });

  if (!message) {
    throw new Error('Message not found or you are not authorized to delete it');
  }

  await ChatRoomMessage.findByIdAndDelete(messageId);

  // Emit real-time event
  const io = (global as any).io;
  if (io) {
    io.emit(`chat_room_message_delete::${message.chatRoom}`, {
      messageId: message._id,
      chatRoomId: message.chatRoom
    });
  }

  return message;
};

export const ChatRoomMessageService = {
  createMessage,
  getMessagesByChatRoom,
  getMessagesBySender,
  deleteMessage
};
