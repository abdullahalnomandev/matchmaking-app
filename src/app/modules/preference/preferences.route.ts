import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PreferenceController } from './preferences.controller';
import { PreferenceValidation } from './preferences.validation';



const router = express.Router();

router
    .route('/')
    .post(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
        validateRequest(PreferenceValidation.createZodSchema),
        PreferenceController.create
    )
    .get(PreferenceController.getAll);

router
    .route('/:id')
    .get(PreferenceController.getById)
    .patch(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        validateRequest(PreferenceValidation.updateZodSchema),
        PreferenceController.update
    )
    .delete(
        auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        PreferenceController.remove);

export const PreferenceRoutes = router;

