import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { ConsultationController } from './consultation.controller';
import { ConsultationRequestController } from './request/request.controller';

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
router.get(
  '/user/my-consultations',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.getUserConsultations,
);

// Handle requests/my-requests specifically before parameter route
router.get(
  '/requests/my-requests',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationRequestController.getConsultationRequestsByUser,
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

router.get(
  '/book/my-consultations',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER
  ),
  ConsultationController.getMyBookedConsultations,
);

export const ConsultationRoutes = router;
