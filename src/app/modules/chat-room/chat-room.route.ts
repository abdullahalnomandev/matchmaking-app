import { Router } from 'express';
import { ChatRoomController } from './chat-room.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

// Public routes - anyone can view chat rooms
router
  .route('/')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    ChatRoomController.getAllChatRooms,
  )
  .post(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.SUPPORT_PARTNER,
      USER_ROLES.BUSINESS_USER,
    ),
    ChatRoomController.createChatRoom,
  );

router
  .route('/support-area/:supportArea')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    ChatRoomController.getChatRoomsBySupportArea,
  );

router
  .route('/:id')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    ChatRoomController.getChatRoomById,
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPPORT_PARTNER),
    ChatRoomController.updateChatRoom,
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN, USER_ROLES.SUPPORT_PARTNER),
    ChatRoomController.deleteChatRoom,
  );

router
  .route('/:id/join')
  .post(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    ChatRoomController.joinChatRoom,
  );

router
  .route('/:id/leave')
  .post(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    ChatRoomController.leaveChatRoom,
  );

export const ChatRoomRoutes = router;
