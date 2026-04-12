import { Router } from 'express';
import { WebinarController } from './webinar.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

// Public routes - anyone can view webinars (with business area filtering)
router
  .route('/')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    WebinarController.getAllWebinars,
  );

router
  .route('/upcoming')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    WebinarController.getUpcomingWebinars,
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
    WebinarController.getWebinarById,
  );

// Admin only routes - require authentication
router
  .route('/')
  .post(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    fileUploadHandler(),
    WebinarController.createWebinar,
  );

router
  .route('/:id')
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    fileUploadHandler(),
    WebinarController.updateWebinar,
  )
  .delete(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    WebinarController.deleteWebinar,
  );

// Update webinar status
router
  .route('/:id/status')
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    WebinarController.updateWebinarStatus,
  );

// Toggle publish status
router
  .route('/:id/publish')
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    WebinarController.togglePublishStatus,
  );

// Toggle comments status
router
  .route('/:id/comments')
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    WebinarController.toggleCommentsStatus,
  );

export const WebinarRoutes = router;
