import { Router } from 'express';
import { SupportController } from './support.controller';
import validateRequest from '../../middlewares/validateRequest';
import { SupportValidation } from './support.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/request',
  auth(USER_ROLES.BUSINESS_USER),
  validateRequest(SupportValidation.createSupportRequestZodSchema),
  SupportController.createSupportRequest
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  SupportController.getAllSupportRequests
);

router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  SupportController.getSingleSupportRequest
);

router.patch(
  '/:id',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  validateRequest(SupportValidation.updateSupportRequestStatusZodSchema),
  SupportController.updateSupportRequest
);

router.post(
  '/:id/accept',
  auth(USER_ROLES.SUPPORT_PARTNER),
  SupportController.acceptSupportRequest
);

export const SupportRoutes = router;
