import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModel } from './user.interface';

const psychologicalScoresSchema = new Schema(
  {
    scores: {
      type: Map,
      of: Number, // key = category name, value = score
      default: {},
    },
    last_taken: { type: Date },
  },
  { _id: false },
);

const personalityResultSchema = new Schema(
  {
    scores: {
      type: Map,
      of: Number,
      default: {},
    },
    last_taken: { type: Date },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String },
    email: { type: String, unique: true, lowercase: true, sparse: true },
    mobile: { type: String, trim: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.BUSINESS_USER,
      required: true,
    },
    canAccessFeature: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
      required: true,
    },
    verified: { type: Boolean, default: false },
    image: { type: String, default: 'https://i.ibb.co/z5YHLV9/profile.png' },
    authorization: {
      oneTimeCode: { type: String },
      expireAt: { type: Date },
    },

    // Psychological & Personality (latest only)
    psychological_scores: { type: psychologicalScoresSchema },
    mbti_type: { type: String },
    personality_scores: { type: personalityResultSchema },

    // Ranking
    ranking_score: {
      psychological: { type: Number, default: 0 }, // 40%
      personality: { type: Number, default: 0 }, // 30%
      experience: { type: Number, default: 0 }, // 20%
      turnover: { type: Number, default: 0 }, // 10%
      activity: { type: Number, default: 0 }, // 10%
    },

    // Optional
    is_activated: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default userSchema;

/* ---------- Static Methods ---------- */

// Check if user exists by ID
userSchema.statics.isExistUserById = async function (id: string) {
  return await this.findById(id);
};

// Check if user exists by email
userSchema.statics.isExistUserByEmail = async function (email: string) {
  return await this.findOne({ email });
};

// Compare passwords
userSchema.statics.isMatchPassword = async function (
  password: string,
  hashPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};

// Check if user is activated (mandatory account creation rules)
userSchema.statics.isActivated = async function (id: string): Promise<boolean> {
  const user = await this.findById(id);
  if (!user) return false;
  const hasTests =
    user.psychological_scores?.last_taken &&
    user.personality_scores?.last_taken;

  return !!(hasTests);
};

/* ---------- Middleware ---------- */

userSchema.pre('save', async function (next) {
  const user = this as IUser;

  // Only check for duplicate on create, not on update
  if (this.isNew) {
    if (user.email) {
      const isExist = await User.exists({ email: user.email });
      if (isExist) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, 'Account already exists!'),
        );
      }
    } else if (user.mobile) {
      const isExist = await User.exists({ mobile: user.mobile });
      if (isExist) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, 'Account already exists!'),
        );
      }
    }
  }

  // Hash password if modified
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds),
  );

  next();
});

export const User = model<IUser, UserModel>('User', userSchema);
