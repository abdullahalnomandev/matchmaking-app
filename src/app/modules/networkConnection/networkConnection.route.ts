import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { NetworkConnectionController } from './networkConnection.controller';
import { NetworkConnectionValidation } from './networkConnection.validation';
import validateActivation from '../../middlewares/validateActivation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateActivation,
    validateRequest(NetworkConnectionValidation.createZodSchema),
    NetworkConnectionController.sendRequest
  )
  .get(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateActivation,
    NetworkConnectionController.getAll
  );

router
  .route('/cancel')
  .post(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.createZodSchema),
    NetworkConnectionController.cancelRequest
  );

router
  .route('/user/:userId')
  .get(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.updateZodSchema),
    NetworkConnectionController.getUserAllNetworks
  );
  
router
  .route('/disconnect/:id')
  .patch(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.updateZodSchema),
    NetworkConnectionController.disconnect
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NetworkConnectionController.getById
  )
  .patch(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(NetworkConnectionValidation.updateZodSchema),
    NetworkConnectionController.updateStatus
  )
  .delete(
    auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    NetworkConnectionController.remove
  );

export const NetworkConnectionRoutes = router;