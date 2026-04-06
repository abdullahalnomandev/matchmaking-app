import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import unlinkFile from '../../../shared/unlinkFile';
import QueryBuilder from '../../builder/QueryBuilder';
import {
  userSearchableField,
} from './user.constant';
import { IUser } from './user.interface';
import { User } from './user.model';
import generateOTP from '../../../util/generateOTP';
import { BUSINESS_EXPERIENCE } from '../../../enums/business';
import { getWeightForExperience, getWeightForTurnover, userRank } from './user.util';


const createUserToDB = async ( payload: Partial<IUser>): Promise<IUser> => {
  if (!payload.email || !payload.password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Email and password are required'
    );
  }

  // Check if user already exists
  const isExistUser = await User.findOne({ email: payload.email });
  if (isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User already exists!');
  }

  // Trim all string values in the payload
  Object.keys(payload).forEach(key => {
    if (typeof (payload as any)[key] === 'string') {
      (payload as any)[key] = (payload as any)[key].trim().replace(/`/g, '');
    }
  });

  if (payload.password !== payload.confirm_password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Password and confirm password do not match"
    );
  }

  // Remove confirm_password so it's not saved to DB
  delete payload.confirm_password;

  // Handle common field mappings
  if ((payload as any).company_name && !payload.company_legal_name) {
    payload.company_legal_name = (payload as any).company_name;
  } else if (payload.company_legal_name && !(payload as any).company_name) {
    (payload as any).company_name = payload.company_legal_name;
  }

  const otp = generateOTP();
  const authorization = {
    oneTimeCode: otp.toString(),
    expireAt: new Date(Date.now() + 3 * 60000),
  };

   // ADD EXPERIENCE AND TURNOVER WEIGHT
   payload.ranking_score = {
    psychological: 0,
    personality: 0,
    experience: 0,
    turnover: 0,
    activity: 0,
   };
   const experienceWeight = getWeightForExperience(payload.experience as BUSINESS_EXPERIENCE);
   const turnoverWeight = getWeightForTurnover(payload.annual_turnover as string);
   payload.ranking_score.experience = experienceWeight;
   payload.ranking_score.turnover = turnoverWeight;


  const userData = {
    ...payload,
    authorization,
  };

  const createUser = await User.create(userData);

  if (!createUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const createAccountTemplate = emailTemplate.createAccount({
    otp: authorization.oneTimeCode,
    email: createUser.email || '',
  });

  emailHelper.sendEmail(createAccountTemplate);

  return createUser;
};

const getUserProfileFromDB = async (user: JwtPayload): Promise<any> => {
  const { id } = user;

  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(id, '-status -authorization')
    .lean();

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

 const totalRakingScore = (isExistUser.ranking_score?.psychological || 0) + 
                          (isExistUser.ranking_score?.personality || 0) + 
                          (isExistUser.ranking_score?.experience || 0) + 
                          (isExistUser.ranking_score?.turnover || 0) + 
                          (isExistUser.ranking_score?.activity || 0);
  // Return all user data + totals
  return {
    ...isExistUser,
    rank_score: totalRakingScore,
    rank_level: userRank(totalRakingScore || 0)
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



const getUserProfileByIdFromDB = async (
  userId: string,
  requestUserId: string
): Promise<any> => {
  // Only unselect the arrays but still need to count their lengths, so will fetch their counts
  const isExistUser = await User.findById(
    requestUserId,
    '-status -role -authorization'
  )
    .lean();

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Return all user data + totals + isConnectedToNetwork
  return {
    ...isExistUser
  };
};

const changePassword = async (
  user: JwtPayload,
  payload: { oldPassword: string; newPassword: string,confirmPassword: string }
) => {
  const { oldPassword, newPassword, confirmPassword } = payload;

  // Find user by ID
  const isExistUser = await User.findById(user.id).select('+password');

  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  // Check old password
  const isPasswordMatched = await User.isMatchPassword(
    oldPassword,
    isExistUser.password
  );

  if (!isPasswordMatched) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Old password is incorrect');
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'New password and confirm password do not match');
  }

  // Set new password (DO NOT hash manually if pre-save exists)
  isExistUser.password = newPassword;
  isExistUser.token = undefined;

  await isExistUser.save(); // 🔥 triggers pre-save hook

  return {
    message: 'Password changed successfully!',
  };
};

export const UserService = {
  createUserToDB,
  getUserProfileFromDB,
  updateProfileToDB,
  getAllUsers,
  getUserProfileByIdFromDB,
  changePassword
};
