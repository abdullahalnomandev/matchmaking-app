import express from 'express';
import { SettingsController } from './settings.controller';

const router = express.Router();

// About routes
router
  .route('/about')
  .post(
    SettingsController.upsertAbout
  )
  .get(
    SettingsController.getAbout
  );

// Privacy Policy routes
router
  .route('/privacy-policy')
  .post(
    SettingsController.upsertPrivacyPolicy
  )
  .get(
    SettingsController.getPrivacyPolicy
  );

// Terms of Services routes
router
  .route('/terms-of-services')
  .post(
    SettingsController.upsertTermsOfServices
  )
  .get(
    SettingsController.getTermsOfServices
  );

export const SettingsRoutes = router;
