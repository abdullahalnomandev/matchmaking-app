import { Model } from 'mongoose';

export interface IQuestionCategory {
  name: string;
  type: 'psychological' | 'personality';
}

export type QuestionCategoryModel = Model<IQuestionCategory>;
