import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import validateRequest from '../../middlewares/validateRequest';
import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import { BlockRoutes } from './block/block.route';
const router = express.Router();

router.post(
  '/psychological-scores',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  validateRequest(UserValidation.updatePsychologicalScoresZodSchema),
  UserController.updatePsychologicalScores
);

router.post(
  '/personality-result',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  validateRequest(UserValidation.updatePersonalityResultZodSchema),
  UserController.updatePersonalityResult
);

router
  .route('/profile')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN), UserController.getUserProfile)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    fileUploadHandler(),
    validateRequest(UserValidation.updateUserZodSchema),
    UserController.updateProfile
  );

router
  .route('/delete')
  .delete(auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN), UserController.deleteAccount)

router
  .route('/')
  .get(auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN), UserController.getAllUsers)
  .post(
    validateRequest(UserValidation.createUserZodSchema),
    UserController.createUser
  );

router
  .route('/profile/user/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN),
    UserController.getUserProfileById
  );

router
  .route('/profile/activity/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN),
    UserController.getUserActivity
  );

router
  .route('/unfollow/:id')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN),
    UserController.unfollowUser
  );

router
  .route('')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN),
    UserController.toggleProfileUpdate
  );

router
  .route('/status/toggle-profile-status/:id')
  .post(
    auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN),
    UserController.toggleProfileUpdate
  );

router
  .route('/statistics')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN),
    UserController.getStatistics
  );

router
  .route('/user-statistics')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN),
    UserController.UserStatistics
  );


router
  .route('/delete-account')
  .delete(UserController.UserDeleteAccount);

  // User Blocks

router.use('/blocks',BlockRoutes)

export const UserRoutes = router;
