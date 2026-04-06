import { model, Schema } from 'mongoose';
import { IQuestionCategory, QuestionCategoryModel } from './questionCategory.interface';

const questionCategorySchema = new Schema<IQuestionCategory, QuestionCategoryModel>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['psychological', 'personality'], required: true },
  },
  { timestamps: true }
);

// Ensure name and type together are unique
questionCategorySchema.index({ name: 1, type: 1 }, { unique: true });

export const QuestionCategory = model<IQuestionCategory, QuestionCategoryModel>(
  'QuestionCategory',
  questionCategorySchema
);
