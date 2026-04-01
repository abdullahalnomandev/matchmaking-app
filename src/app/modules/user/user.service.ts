import { StatusCodes } from 'http-status-codes';
import { JwtPayload, Secret } from 'jsonwebtoken';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { jwtHelper } from '../../../helpers/jwtHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import setCronJob from '../../../shared/setCronJob';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import { Comment } from '../post/comment/comment.model';
import { Like } from '../post/like';
import { Post } from '../post/post.model';
import {
  ACTIVITY_TYPE,
  userSearchableField,
} from './user.constant';
import { IUser } from './user.interface';
import { User } from './user.model';
import { Notification } from '../notification/notification.mode';
import generateOTP from '../../../util/generateOTP';
import { USER_POST_TYPE } from '../post/post.constant';
import { Save } from '../post/save';
import { updateUserAccessFeature } from '../../../util/updateUserAccessFeature';
import e from 'cors';
import { PostView } from '../post/postView/postView.model';
import { IPsychologicalScores, IPersonalityResult } from './user.interface';
import { BUSINESS_EXPERIENCE, USER_RANK } from '../../../enums/business';
import { Company } from '../company/company.model';
import { NETWORK_CONNECTION_STATUS } from '../networkConnection/networkConnection.constant';
import { NetworkConnection } from '../networkConnection/networkConnection.model';

const calculateRank = (score: number): USER_RANK => {
  if (score <= 20) return USER_RANK.BRONZE;
  if (score <= 40) return USER_RANK.SILVER;
  if (score <= 60) return USER_RANK.GOLD;
  if (score <= 80) return USER_RANK.PLATINUM;
  return USER_RANK.ELITE;
};

const updateRankingScore = async (userId: string) => {
  const user = await User.findById(userId).lean();
  if (!user) return;

  let psychologicalWeight = 0;
  if (user.psychological_scores) {
    const scores = user.psychological_scores;
    const avg = (
      scores.accountability +
      scores.emotional_stability +
      scores.conflict_management +
      scores.impulsivity +
      scores.ethics_rule_adherence +
      scores.stress_tolerance +
      scores.long_term_commitment +
      scores.transparency_honesty
    ) / 8;
    psychologicalWeight = avg * 0.4;
  }

  const personalityWeight = user.personality_result ? 100 * 0.2 : 0;

  let companyWeight = 0;
  const companies = await Company.find({ owner: userId });
  if (companies.length > 0) {
    const totalTurnover = companies.reduce((sum, company) => sum + company.turnover, 0);
    let turnoverScore = 0;
    if (totalTurnover > 5000000) turnoverScore = 100;
    else if (totalTurnover > 1000000) turnoverScore = 80;
    else if (totalTurnover > 500000) turnoverScore = 60;
    else if (totalTurnover > 100000) turnoverScore = 40;
    else turnoverScore = 20;
    companyWeight = turnoverScore * 0.2;
  }

  let experienceWeight = 0;
  if (user.experience) {
    let expScore = 0;
    switch (user.experience) {
      case BUSINESS_EXPERIENCE.TWENTY_PLUS: expScore = 100; break;
      case BUSINESS_EXPERIENCE.ELEVEN_TWENTY: expScore = 80; break;
      case BUSINESS_EXPERIENCE.SIX_TEN: expScore = 60; break;
      case BUSINESS_EXPERIENCE.THREE_FIVE: expScore = 40; break;
      case BUSINESS_EXPERIENCE.ZERO_TWO: expScore = 20; break;
    }
    experienceWeight = expScore * 0.1;
  }

  // Activity weight (simplified for now)
  const activityWeight = 50 * 0.1;

  const totalScore = psychologicalWeight + personalityWeight + companyWeight + experienceWeight + activityWeight;
  const rank = calculateRank(totalScore);

  const now = new Date();
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(now.getMonth() - 6);

  const hasFreshTests = (user.psychological_scores?.last_taken && new Date(user.psychological_scores.last_taken) > sixMonthsAgo) &&
                        (user.personality_result?.last_taken && new Date(user.personality_result.last_taken) > sixMonthsAgo);

  const isActivated = !!(
    (user.vat_number || user.company_id_number) &&
    user.company_legal_name &&
    user.company_website &&
    hasFreshTests
  );

  await User.findByIdAndUpdate(userId, {
    ranking_score: totalScore,
    rank,
    is_activated: isActivated,
  });
};

const updatePsychologicalScores = async (userId: string, scores: IPsychologicalScores) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const now = new Date();
  if (user.psychological_scores?.last_taken) {
    const lastTaken = new Date(user.psychological_scores.last_taken);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    
    // In production, we might want to block if taken too recently, 
    // but the BRD says "Mandatory retake every 6 months", which implies 
    // it's a requirement to keep it fresh.
  }

  const updatedScores = { ...scores, last_taken: now };
  
  const result = await User.findByIdAndUpdate(
    userId,
    {
      $set: { psychological_scores: updatedScores },
      $push: { psychological_history: updatedScores }
    },
    { new: true }
  );
  
  await updateRankingScore(userId);
  return result;
};

const updatePersonalityResult = async (userId: string, result: IPersonalityResult) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');

  const now = new Date();
  const updatedResult = { ...result, last_taken: now };

  const updateResult = await User.findByIdAndUpdate(
    userId,
    {
      $set: { personality_result: updatedResult },
      $push: { personality_history: updatedResult }
    },
    { new: true }
  );
  
  await updateRankingScore(userId);
  return updateResult;
};


const willBeDeleteUser = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user.status === 'delete') {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User Not Found !!');
  }

  const isPasswordMatch = await User.isMatchPassword(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Incorrect password');
  }

  user.status = 'delete';
  await user.save();
  return user;
};


const createUserToDB = async (
  payload: Partial<IUser>
): Promise<IUser | { accessToken: string }> => {
  if (!payload.password && !payload.email) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Email and password are required'
    );
  }

  const otp = generateOTP();
  const authorization = {
    oneTimeCode: otp.toString(),
    expireAt: new Date(Date.now() + 3 * 60000),
  };

  const createUser = await User.create(payload);

  if (!createUser)
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');

  if (!createUser?.email) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Missing email'
    );
  }

  const createAccountTemplate = emailTemplate.createAccount({
    otp: authorization.oneTimeCode,
    email: createUser.email,
  });

  emailHelper.sendEmail(createAccountTemplate);

  await User.findByIdAndUpdate(createUser._id, { $set: { authorization } });

  return createUser;
};

const getUserProfileFromDB = async (user: JwtPayload): Promise<any> => {
  const { id } = user;

  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(id, '-status -authorization')
    .lean()
    .populate('preferences');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Fetch total posts and network connections for the user
  const [totalPost, totalNetwork, companies] = await Promise.all([
    Post.countDocuments({ creator: id }),
    NetworkConnection.countDocuments({
      $or: [{ requestFrom: id }, { requestTo: id }],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED,
    }),
    Company.find({ owner: id }).lean(),
  ]);

  // Return all user data + totals
  return {
    ...isExistUser,
    totalPost,
    totalNetwork,
    companies,
  };
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>
): Promise<Partial<IUser | null> | undefined> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (payload.email) {
    delete payload.email;
  }

  if (payload.image === isExistUser.image) {
    unlinkFile(payload.image as string);
  }

  const updatedUser = await User.findByIdAndUpdate(
    id,
    { $set: payload },
    { new: true }
  ).lean();

  if (updatedUser) {
    await updateRankingScore(id);
    delete (updatedUser as any).authorization;
    delete (updatedUser as any).status;
  }

  return updatedUser;
};

const getAllUsers = async (query: Record<string, any>) => {
  const club_id = query.club_id;

  // Build base query
  let baseQuery = User.find();

  const userQuery = new QueryBuilder(baseQuery, query)
    .paginate()
    .search(userSearchableField)
    .fields()
    .filter(['club_id'])
    .sort();

  const result = await userQuery.modelQuery.lean();
  const pagination = await userQuery.getPaginationInfo();

  return {
    pagination,
    data: result,
  };
};
// .populate({
//   path: "airlineVerification",
//   match: { paymentStatus: "paid" },
//   select: "designation plan employeeId images paymentStatus paymentMethod",
//   populate: {
//     path: "plan",
//     select: "-active",
//   },

export const unfollowUser = async (userId: string, targetId: string) => {
  if (userId === targetId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot unfollow yourself');
  }

  await User.findByIdAndUpdate(userId, {
    $pull: { 'profile.following': targetId },
  });

  await User.findByIdAndUpdate(targetId, {
    $pull: { 'profile.followers': userId },
  });
};


const getUserProfileByIdFromDB = async (
  userId: string,
  requestUserId: string
): Promise<any> => {
  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(
    requestUserId,
    '-status -role -authorization'
  )
    .lean()
    .populate('preferences');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Fetch total posts and network connections for the user
  const [totalPost, totalNetwork, isConnectedToNetwork, companies] = await Promise.all([
    Post.countDocuments({ creator: requestUserId }),
    NetworkConnection.countDocuments({
      $or: [{ requestFrom: requestUserId }, { requestTo: requestUserId }],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED,
    }),
    NetworkConnection.exists({
      $or: [
        { requestFrom: userId, requestTo: requestUserId },
        { requestTo: userId, requestFrom: requestUserId },
      ],
      status: NETWORK_CONNECTION_STATUS.ACCEPTED,
    })
      .lean()
      .then(result => !!result),
    Company.find({ owner: requestUserId }).lean(),
  ]);

  // Return all user data + totals + isConnectedToNetwork
  return {
    ...isExistUser,
    totalPost,
    totalNetwork,
    isConnectedToNetwork,
    companies,
  };
};


const getUserActivityFromDB = async (
  requestUserId: string,
  myUserId: string,
  query: Record<string, any>
): Promise<{ data: any[]; pagination: any }> => {
  let activityQuery: any;
  let includeVideoCount = false;

  if (query.type === ACTIVITY_TYPE.POST) {
    activityQuery = Post.find({ creator: requestUserId });
    includeVideoCount = true;
  } else if (query.type === ACTIVITY_TYPE.VIDEO) {
    activityQuery = Post.find({
      creator: requestUserId,
      type: USER_POST_TYPE.VIDEO,
    });
    includeVideoCount = true;
  } else if (query.type === ACTIVITY_TYPE.LIKE) {
    activityQuery = Like.find({ user: requestUserId }).populate('post');
  } else if (query.type === ACTIVITY_TYPE.SAVE) {
    activityQuery = Save.find({ user: requestUserId }).populate('post');
  }

  if (!activityQuery) {
    throw new Error('Invalid activity type');
  }

  const userQuery = new QueryBuilder(activityQuery, query)
    .paginate()
    .fields()
    .sort();

  let result = await userQuery.modelQuery.lean();
  const pagination = await userQuery.getPaginationInfo();

  /**
   * VIDEO VIEW COUNT LOGIC
   */
  if (includeVideoCount && Array.isArray(result)) {
    const postIds = result
      .filter((post: any) => post.type === USER_POST_TYPE.VIDEO)
      .map((post: any) => post._id);

    const videoViewMap: Record<string, number> = {};

    if (postIds.length > 0) {
      const viewCounts = await PostView.aggregate([
        { $match: { video: { $in: postIds } } },
        {
          $group: {
            _id: '$video',
            count: { $sum: 1 },
          },
        },
      ]);

      for (const vc of viewCounts) {
        videoViewMap[vc._id.toString()] = vc.count;
      }
    }

    result = result.map((item: any) => ({
      ...item,
      ...(item.type === USER_POST_TYPE.VIDEO && {
        videoViewCount: videoViewMap[item._id.toString()] || 0,
      }),
    }));
  }

  return {
    data: result,
    pagination,
  };
};

// DASHBOARD ANALYTICS


const getUserStatistics = async (year: number, userId: string) => {
  // Set months for the whole year
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Set the start and end of the year for querying
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  // Get new users aggregate per month in a single command
  const newUsersAgg = await User.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        verified: true,
      }
    },
    {
      $group: {
        _id: { month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      }
    }
  ]);

  // Map month (1-based) to user count for quick lookup
  const monthToCount = Array(12).fill(0);
  newUsersAgg.forEach((item: any) => {
    // Month in MongoDB is 1-indexed (Jan: 1)
    monthToCount[item._id.month - 1] = item.count;
  });

  // Only show up to the last month if querying this year
  const now = new Date();
  const isThisYear = year === now.getFullYear();
  const limitMonth = isThisYear ? now.getMonth() + 1 : 12;

  // Compose userStats with cumulative sum
  let runningTotal = 0;
  const userStats = [];
  for (let i = 0; i < limitMonth; i++) {
    runningTotal += monthToCount[i];
    userStats.push({
      month: months[i],
      newUsers: monthToCount[i],
      cumulativeNewUsers: runningTotal,
    });
  }

  return {
    year,
    totalNewUsers: runningTotal,
    userStats,
  };
};



const statistics = async () => {
  const [totalUser, totalCompany, totalNetwork] = await Promise.all([
    User.countDocuments({ verified: true }),
    Company.countDocuments(),
    NetworkConnection.countDocuments({ status: NETWORK_CONNECTION_STATUS.ACCEPTED }),
  ]);

  return {
    totalUser,
    totalCompany,
    totalNetwork,
  };
};


const toggleProfileUpdate = async (userId: string) => {
  // Find the user by ID
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Toggle user status between 'active' and 'delete'
  user.status = user.status === 'active' ? 'delete' : 'active';
  await user.save();

  return user;
}


const deleteAccount = async (password: string, userId: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User not found');
  }

  // Use User.isMatchPassword
  const isMatch = await User.isMatchPassword(password, user.password);
  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  const deletedUser = await User.findByIdAndDelete(userId);
  if (!deletedUser) {
    throw new Error('User not found');
  }
  return deletedUser;
}


export const UserService = {
  willBeDeleteUser, // Expose the new service here
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  unfollowUser,
  getAllUsers,
  getUserProfileByIdFromDB,
  getUserActivityFromDB,
  statistics,
  getUserStatistics,
  toggleProfileUpdate,
  deleteAccount,
  updatePsychologicalScores,
  updatePersonalityResult,
  updateRankingScore,
};
