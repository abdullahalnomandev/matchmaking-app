import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { WebinarCommentController } from './webinar-comment.controller';

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
    WebinarCommentController.createComment,
  )

router
  .route('/:id')
  .patch(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER
    ),
    WebinarCommentController.updateComment,
  )
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER
    ),
    WebinarCommentController.getCommentsByWebinar,
  )
  .delete(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER
    ),
    WebinarCommentController.deleteComment,
  );

export const WebinarCommentRoutes = router;
