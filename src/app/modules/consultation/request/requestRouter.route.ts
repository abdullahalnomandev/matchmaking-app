import express from 'express';

import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import { ConsultationRequestController } from './request.controller';

const router = express.Router();

// =========================
// Common roles (DRY)
// =========================
const ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.BUSINESS_USER,
  USER_ROLES.SUPPORT_PARTNER,
];

// =========================
// Create consultation request
// =========================
router.post(
  '/',
  auth(...ROLES),
  ConsultationRequestController.createConsultationRequest
);

// =========================
// Get all consultation requests
// =========================
router.get(
  '/',
  auth(...ROLES),
  ConsultationRequestController.getConsultationRequests
);

// =========================
// Get current user requests
// =========================
router.get(
  '/my-requests',
  auth(...ROLES),
  ConsultationRequestController.getConsultationRequestsByUser
);

// =========================
// Get request by ID
// =========================
router.get(
  '/:requestId',
  auth(...ROLES),
  ConsultationRequestController.getConsultationRequestById
);

// =========================
// Update request
// =========================
router.patch(
  '/:requestId',
  auth(...ROLES),
  ConsultationRequestController.updateConsultationRequest
);

// =========================
// Delete request
// =========================
router.delete(
  '/:requestId',
  auth(...ROLES),
  ConsultationRequestController.deleteConsultationRequest
);

export const ConsultationRequestRoutes = router;