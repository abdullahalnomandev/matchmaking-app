import { model, Schema } from 'mongoose';
import { SimpleQuestion } from './question.interface';

const questionSchema = new Schema<SimpleQuestion>(
  {
    text: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'QuestionCategory',
      required: true,
    },
  },
  { timestamps: true }
);

export const Question = model<SimpleQuestion>('Question', questionSchema);
