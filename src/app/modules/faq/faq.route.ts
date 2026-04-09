import { Router } from 'express';
import { FaqController } from './faq.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';


const router = Router();

// Public routes - anyone can view FAQs
router.route('/').get(FaqController.getAllFaqs);
router.route('/:id').get(FaqController.getFaqById);

// Admin only routes - require authentication
router.route('/')
  .post(
    // auth(
    //   USER_ROLES.SUPER_ADMIN, 
    //   USER_ROLES.ADMIN
    // ),
    FaqController.createFaq
  );

router.route('/:id')
  .patch(
    // auth(
    //   USER_ROLES.SUPER_ADMIN, 
    //   USER_ROLES.ADMIN
    // ),
    FaqController.updateFaq
  )
  .delete(
      // auth(
      //   USER_ROLES.SUPER_ADMIN, 
      //   USER_ROLES.ADMIN
      // ),
    FaqController.deleteFaq
  );

// Toggle status
router.route('/:id/toggle')
  .patch(
    // auth(
    //   USER_ROLES.SUPER_ADMIN, 
    //   USER_ROLES.ADMIN
    // ),
    FaqController.toggleFaqStatus
  );

export const FaqRoutes = router;
