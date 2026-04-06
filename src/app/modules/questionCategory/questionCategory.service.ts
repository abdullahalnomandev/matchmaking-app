import { IQuestionCategory } from './questionCategory.interface';
import { QuestionCategory } from './questionCategory.model';

const createCategory = async (payload: IQuestionCategory) => {
  const existing = await QuestionCategory.findOne({ name: payload.name });
  if (existing) {
    throw new Error('A category with this name already exists.');
  }
  return await QuestionCategory.create(payload);
};

const getAllCategories = async (type?: 'psychological' | 'personality') => {
  const query = type ? { type } : {};
  return await QuestionCategory.find(query);
};

const getCategoryById = async (id: string) => {
  return await QuestionCategory.findById(id);
};

const updateCategory = async (id: string, payload: Partial<IQuestionCategory>) => {
  return await QuestionCategory.findByIdAndUpdate(id, payload, { new: true });
};

const deleteCategory = async (id: string) => {
  return await QuestionCategory.findByIdAndDelete(id);
};

export const QuestionCategoryService = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
