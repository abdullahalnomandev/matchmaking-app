import express from 'express';
import { QuestionCategoryController } from './questionCategory.controller';

const router = express.Router();

router.post('/', QuestionCategoryController.createCategory);
router.get('/', QuestionCategoryController.getAllCategories);
router.get('/:id', QuestionCategoryController.getCategoryById);
router.patch('/:id', QuestionCategoryController.updateCategory);
router.delete('/:id', QuestionCategoryController.deleteCategory);

export const QuestionCategoryRoutes = router;
