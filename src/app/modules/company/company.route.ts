import { Router } from 'express';
import { CompanyController } from './company.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CompanyValidation } from './company.validation';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = Router();

router.post(
  '/create',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  validateRequest(CompanyValidation.createCompanyZodSchema),
  CompanyController.createCompany
);

router.get(
  '/',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  CompanyController.getAllCompanies
);

router.get(
  '/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  CompanyController.getSingleCompany
);

router.patch(
  '/:id',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER),
  validateRequest(CompanyValidation.updateCompanyZodSchema),
  CompanyController.updateCompany
);

router.delete(
  '/:id',
  auth(USER_ROLES.BUSINESS_USER, USER_ROLES.SUPPORT_PARTNER, USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  CompanyController.deleteCompany
);

export const CompanyRoutes = router;
