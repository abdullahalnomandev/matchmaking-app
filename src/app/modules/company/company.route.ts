import { Router } from 'express';
import { CompanyController } from './company.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = Router();

// Public routes - authenticated users can view companies
router
  .route('/')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getAllCompanies,
  );

router
  .route('/count')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getCompanyCount,
  );

router
  .route('/my-companies')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getMyCompanies,
  );


router
  .route('/verified')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getVerifiedCompanies,
  );

router
  .route('/business-area/:businessArea')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getCompaniesByBusinessArea,
  );

router
  .route('/country/:country')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getCompaniesByCountry,
  );

router
  .route('/:id')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getCompanyById,
  );

// User specific routes - get own company
router
  .route('/my-company')
  .get(
    auth(
      USER_ROLES.ADMIN,
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.getMyCompany,
  );

// Admin only routes - require authentication
router
  .route('/')
  .post(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    fileUploadHandler(),
    CompanyController.createCompany,
  );

router
  .route('/:id')
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    fileUploadHandler(),
    CompanyController.updateCompany,
  )
  .delete(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.BUSINESS_USER,
      USER_ROLES.SUPPORT_PARTNER,
    ),
    CompanyController.deleteCompany,
  );

// Admin routes for status management
router
  .route('/:id/verify')
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
    ),
    CompanyController.toggleVerificationStatus,
  );

router
  .route('/:id/status')
  .patch(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
    ),
    CompanyController.toggleCompanyStatus,
  );

export const CompanyRoutes = router;
