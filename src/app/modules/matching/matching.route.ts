import { Router } from 'express';
import { MatchingController } from './matching.controller';
import auth from '../../middlewares/auth';
import validateActivation from '../../middlewares/validateActivation';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.get(
  '/top-matches',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  validateActivation,
  MatchingController.getTopMatches
);

export const MatchingRoutes = router;
