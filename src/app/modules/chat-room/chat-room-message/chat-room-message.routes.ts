import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { ChatRoomMessageController } from './chat-room-message.controller';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';

const router = express.Router();

// Create message
router.post(
  '/',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  fileUploadHandler(),
  ChatRoomMessageController.createMessage,
);

// Get messages by chat room
router.get(
  '/chat-room/:chatRoomId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ChatRoomMessageController.getMessagesByChatRoom,
);

// Get messages by current user (sender)
router.get(
  '/my-messages',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ChatRoomMessageController.getMessagesBySender,
);

// Delete message
router.delete(
  '/:messageId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ChatRoomMessageController.deleteMessage,
);

export const ChatRoomMessageRoutes = router;
