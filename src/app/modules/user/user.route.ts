import express, { NextFunction } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
const router = express.Router();

router
  .route('/profile')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
      USER_ROLES.SUPER_ADMIN,
    ),
    UserController.getUserProfile,
  )
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    fileUploadHandler(),
    validateRequest(UserValidation.updateUserZodSchema),
    UserController.updateProfile,
  );

router
  .route('/profile/:id')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
      USER_ROLES.SUPER_ADMIN,
    ),
    UserController.getUserProfileById,
  );

router
  .route('/')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
      USER_ROLES.SUPER_ADMIN,
    ),
    UserController.getAllUsers,
  )
  .post(UserController.createUser);

router.patch(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  fileUploadHandler(),
  auth(
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER,
  ),
  UserController.updateUser,
);

router
  .route('/profile/user/:id')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
      USER_ROLES.SUPER_ADMIN,
    ),
    UserController.getUserProfileById,
  );

router
  .route('/matchable-users')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
      USER_ROLES.SUPER_ADMIN,
    ),
    UserController.getMatchableUsers,
  );

router
  .route('/change-password')
  .post(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    UserController.changePassword,
  );

router
  .route('/match-count')
  .get(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    UserController.getMatchCount,
  );

export const UserRoutes = router;
