import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ConversationController } from './conversation.controller';
import validateActivation from '../../middlewares/validateActivation';


const router = express.Router();

router
  .route('/')
  .post(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER
    ),
    validateActivation,
    ConversationController.createConversation
  )
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER
    ),
    validateActivation,
    ConversationController.getAllConversaions
  );

  router.delete(
    '/:id',
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER
    ),
    ConversationController.deleteConversation
  );

export const ConversationRoutes = router;