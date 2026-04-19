import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ConsultationController } from './consultation.controller';

const router = express.Router();

// Create consultation
router.post(
  '/',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.createConsultation,
);

// Get all consultations
router.get(
  '/',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.getConsultations,
);

// Get consultations by company
router.get(
  '/company/:companyId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.getConsultationsByCompany,
);

// Get consultations by current user (creator)
router.get(
  '/my-consultations',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.getConsultationsByCreator,
);

// Get consultation by ID
router.get(
  '/:consultationId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.getConsultationById,
);

// Update consultation
router.patch(
  '/:consultationId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.updateConsultation,
);

// Delete consultation
router.delete(
  '/:consultationId',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.deleteConsultation,
);

export const ConsultationRoutes = router;
