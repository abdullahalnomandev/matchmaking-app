import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { LikeRoutes } from './like';
import { SaveRoutes } from './save';
import { PostController } from './post.controller';
import auth from '../../middlewares/auth';
import validateActivation from '../../middlewares/validateActivation';
import { ReportRoutes } from './report/report.route';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    validateActivation,
    fileUploadHandler(),
    PostController.createPost
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    validateActivation,
    PostController.getAllPosts
  );

router.get('/user-liked',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  PostController.getALlUserLikedPost);

router
  .route('/drafts')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    PostController.getAllMyDrafts
  );

router
  .route('/view/:videoId')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    PostController.viewVideo // corrected controller action
  );

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    fileUploadHandler(),
    PostController.updatePost
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    fileUploadHandler(),
    PostController.deletePost
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
    fileUploadHandler(),
    PostController.getSinglePost
  );

// Like routes - nested under posts
router.use('/:postId/likes', LikeRoutes);

// Save routes - nested under posts
router.use('/:postId/saves', SaveRoutes);

// Report routes - nested under posts
router.use('/reports', ReportRoutes);


export const PostRoutes = router;
