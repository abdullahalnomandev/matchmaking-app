import express from 'express';
import { QuestionController } from './question.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post('/', QuestionController.createQuestion);
router.post(
  '/psychological-test',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER,
    USER_ROLES.SUPER_ADMIN,
  ),
  QuestionController.createPsychologicalTestQuestions,
);

router.post(
  '/personality-test',
  auth(
    USER_ROLES.ADMIN,
    USER_ROLES.BUSINESS_USER,
    USER_ROLES.SUPPORT_PARTNER,
    USER_ROLES.SUPER_ADMIN,
  ),
  QuestionController.createPersonalityTestQuestions,
);

router.get('/', QuestionController.getAllQuestions);
router.get('/category/:categoryId', QuestionController.getQuestionsByCategory);
router.get('/:id', QuestionController.getQuestionById);
router.patch('/:id', QuestionController.updateQuestion);
router.delete('/:id', QuestionController.deleteQuestion);

export const QuestionRoutes = router;
