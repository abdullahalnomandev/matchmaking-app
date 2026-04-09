import { Router } from 'express';
import { NewsletterController } from './newsletter.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

// Public routes - anyone can view newsletters
router.route('/').get(NewsletterController.getAllNewsletters);
router.route('/:id').get(NewsletterController.getNewsletterById);

// Admin only routes - require authentication
router.route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.BUSINESS_USER,USER_ROLES.SUPPORT_PARTNER),
    fileUploadHandler(),
    NewsletterController.createNewsletter
  );

router.route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.BUSINESS_USER,USER_ROLES.SUPPORT_PARTNER),
    fileUploadHandler(),
    NewsletterController.updateNewsletter
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.BUSINESS_USER,USER_ROLES.SUPPORT_PARTNER),
    NewsletterController.deleteNewsletter
  );

// Toggle status
router.route('/:id/toggle')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN,USER_ROLES.BUSINESS_USER,USER_ROLES.SUPPORT_PARTNER),
      NewsletterController.toggleNewsletterStatus
  );

export const NewsletterRoutes = router;
