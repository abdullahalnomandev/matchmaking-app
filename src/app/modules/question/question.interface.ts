import { Types } from 'mongoose';
import { IQuestionCategory } from '../questionCategory/questionCategory.interface';

export interface SimpleQuestion {
  text: string;
  type: 'psychological' | 'personality'; // tells which group
  category: Types.ObjectId | IQuestionCategory; // e.g., "emotional_stability", "openness"
}
