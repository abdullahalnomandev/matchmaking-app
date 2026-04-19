import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { WebinarLikeController } from './webinar-like.controller';

const router = express.Router();

// Toggle comment like/unlike
router.patch(
  '/:commentId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  WebinarLikeController.toggleCommentLike,
);

export const WebinarLikeRoutes = router;
