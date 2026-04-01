import express from 'express';
import { USER_ROLES } from '../../../../enums/user';
import auth from '../../../middlewares/auth';
import { SaveController } from './save.controller';

const router = express.Router();

router.post(
  '/toggle/:postId',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SaveController.toggleSave
);

router.get('/:postId', SaveController.getPostSaves);

router.get(
  '/:postId/status',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
  SaveController.getUserSaveStatus
);

export const SaveRoutes = router;

