import { Types } from 'mongoose';
import { SimpleQuestion } from './question.interface';
import { Question } from './question.model';
import { QuestionCategory } from '../questionCategory/questionCategory.model';
import { User } from '../user/user.model';
import {
  getWeightForExperience,
  getWeightForTurnover,
} from '../user/user.util';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';

const createQuestion = async (payload: SimpleQuestion) => {
  return await Question.create(payload);
  // return await Question.insertMany(payload);
};

const getAllQuestions = async (type?: 'psychological' | 'personality') => {
  const query = type ? { type } : {};
  return await Question.find(query).populate('category', 'name type');
};

const getQuestionsByCategory = async (categoryId: string) => {
  // Get questions for that category
  const questions = await Question.find({ category: categoryId }).select(
    '-__v -createdAt -updatedAt -category',
  );

  // Get category info and include totalQuestions
  const category = await QuestionCategory.findById(categoryId)
    .select('name type')
    .lean(); // convert to plain object so we can add a new property

  return {
    category: {
      ...category,
      totalQuestions: questions.length,
    },
    questions,
  };
};

const getQuestionById = async (id: string) => {
  return await Question.findById(id).populate('category', 'name type');
};

const updateQuestion = async (id: string, payload: Partial<SimpleQuestion>) => {
  return await Question.findByIdAndUpdate(id, payload, { new: true }).populate(
    'category',
    'name type',
  );
};

const deleteQuestion = async (id: string) => {
  return await Question.findByIdAndDelete(id);
};

// PSYCHOLOGICAL TEST QUESTIONS
const createPsychologicalTestQuestions = async (
  payload: any[],
  userId: string,
) => {
  const user = await User.findById(userId);

  const is6MonthsPassed =
    user?.psychological_scores?.last_taken &&
    new Date().getTime() -
      new Date(user?.psychological_scores?.last_taken).getTime() >
      6 * 30 * 24 * 60 * 60 * 1000;

  if (!is6MonthsPassed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You can only take the test once every 6 months',
    );
  }

  // Fetch all questions
  const questions = await Question.find({
    _id: { $in: payload.map(q => new Types.ObjectId(q.questionId)) },
  }).populate('category', 'name'); // only populate category name

  // Group questions by category
  const categoryMap: Record<string, { score: number; count: number }> = {};

  questions.forEach(q => {
    const score =
      payload.find(p => p.questionId === q._id.toString())?.score ?? 5; // default 5
    const categoryName = (q.category as any).name;

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { score: 0, count: 0 };
    }

    categoryMap[categoryName].score += score;
    categoryMap[categoryName].count += 1;
  });

  // Convert to percentage out of 100 for each category
  const categoryScores = Object.entries(categoryMap).map(
    ([categoryName, { score, count }]) => ({
      categoryName,
      score: Math.round((score / (count * 5)) * 100), // each question max score 5
    }),
  );

  // Convert object formate
  const result = categoryScores.reduce(
    (acc, item) => {
      const key = item.categoryName.toLowerCase().replace(/\s+/g, '_'); // clean key
      acc[key] = item.score;
      return acc;
    },
    {} as Record<string, number>,
  );
  // 40% of total score and total q

  const rankingScore =
    Math.round(
      Object.values(result).reduce((a, b) => a + b, 0) /
        Object.values(result).length,
    ) * 0.4;

  await User.findByIdAndUpdate(
    userId,
    {
      psychological_scores: {
        scores: result,
        last_taken: new Date(),
      },
      ranking_score: {
        psychological: Math.round(rankingScore),
        personality: user?.ranking_score?.personality || 0,
        experience: user?.ranking_score?.experience || 0,
        turnover: user?.ranking_score?.turnover || 0,
        activity: user?.ranking_score?.activity || 0,
      },
    },
    { new: true },
  );
  return {
    result,
  };
};

// PERSONALITY TEST QUESTIONS
const createPersonalityTestQuestions = async (
  payload: any[],
  userId: string,
) => {
  const user = await User.findById(userId);

  const is6MonthsPassed =
    user?.psychological_scores?.last_taken &&
    new Date().getTime() -
      new Date(user?.psychological_scores?.last_taken).getTime() >
      6 * 30 * 24 * 60 * 60 * 1000;

  if (!is6MonthsPassed) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'You can only take the test once every 6 months',
    );
  }

  // Fetch all questions
  const questions = await Question.find({
    _id: { $in: payload.map(q => new Types.ObjectId(q.questionId)) },
  }).populate('category', 'name');

  // Group by category (Big Five)
  const categoryMap: Record<string, { score: number; count: number }> = {};

  questions.forEach(q => {
    const score =
      payload.find(p => p.questionId === q._id.toString())?.score ?? 5;

    const categoryName = (q.category as any).name;

    if (!categoryMap[categoryName]) {
      categoryMap[categoryName] = { score: 0, count: 0 };
    }

    categoryMap[categoryName].score += score;
    categoryMap[categoryName].count += 1;
  });

  // Convert to % (Big Five)
  const result = Object.entries(categoryMap).reduce(
    (acc, [categoryName, { score, count }]) => {
      const key = categoryName.toLowerCase().replace(/\s+/g, '_');
      acc[key] = Math.round((score / (count * 5)) * 100);
      return acc;
    },
    {} as Record<string, number>,
  );
  console.log('result', result);

  // ✅ MBTI Calculation (from Big Five)
  const E = result.extraversion || 0;
  const I = 100 - E;

  const N = result.openness || 0;
  const S = 100 - N;

  const F = result.agreeableness || 0;
  const T = result.emotional_stability || 0;

  const J = result.conscientiousness || 0;
  const P = 100 - J;

  const mbti =
    (E > I ? 'E' : 'I') +
    (S > N ? 'S' : 'N') +
    (T > F ? 'T' : 'F') +
    (J > P ? 'J' : 'P');

  // ✅ Ranking Score (20%)
  const avg =
    Object.values(result).reduce((a, b) => a + b, 0) /
    Object.values(result).length;

  const rankingScore = Math.round(avg * 0.2);

  await User.findByIdAndUpdate(
    userId,
    {
      mbti_type: mbti,
      personality_scores: {
        scores: result,
        last_taken: new Date(),
      },
      ranking_score: {
        psychological: user?.ranking_score?.psychological || 0,
        personality: rankingScore,
        experience: user?.ranking_score?.experience || 0,
        turnover: user?.ranking_score?.turnover || 0,
        activity: user?.ranking_score?.activity || 0,
      },
    },
    { new: true },
  );

  return {
    result,
    mbti,
  };
};

export const QuestionService = {
  createQuestion,
  getAllQuestions,
  getQuestionsByCategory,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  createPsychologicalTestQuestions,
  createPersonalityTestQuestions,
};
