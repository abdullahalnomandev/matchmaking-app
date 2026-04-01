import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModel } from './user.interface';
import { PROFILE_MODE } from './user.constant';
import { BUSINESS_EXPERIENCE, COMPANY_POSITION, USER_RANK } from '../../../enums/business';

const psychologicalScoresSchema = new Schema({
  accountability: { type: Number, default: 0 },
  emotional_stability: { type: Number, default: 0 },
  conflict_management: { type: Number, default: 0 },
  impulsivity: { type: Number, default: 0 },
  ethics_rule_adherence: { type: Number, default: 0 },
  stress_tolerance: { type: Number, default: 0 },
  long_term_commitment: { type: Number, default: 0 },
  transparency_honesty: { type: Number, default: 0 },
  last_taken: { type: Date },
}, { _id: false });

const personalityResultSchema = new Schema({
  mbti_type: { type: String },
  big_five: {
    openness: { type: Number, default: 0 },
    conscientiousness: { type: Number, default: 0 },
    extraversion: { type: Number, default: 0 },
    agreeableness: { type: Number, default: 0 },
    emotional_stability: { type: Number, default: 0 },
  },
  last_taken: { type: Date },
}, { _id: false });

const userSchema = new Schema<IUser, UserModel>(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      sparse: true,
    },
    canAccessFeature: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: 'https://i.ibb.co/z5YHLV9/profile.png',
    },
    mobile: {
      type: String,
      trim: true,
    },
    confirm_password: {
      type: String,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.BUSINESS_USER,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    location: {
      type: String,
    },
    about: {
      type: String,
    },
    profile_mode: {
      type: String,
      enum: Object.values(PROFILE_MODE),
      default: PROFILE_MODE.PUBLIC,
    },
    preferences: [
      {
        type: String,
      },
    ],
    authorization: {
      oneTimeCode: { type: String },
      expireAt: { type: Date },
    },
    // New fields from BRD
    vat_number: { type: String },
    company_id_number: { type: String },
    company_legal_name: { type: String },
    company_website: { type: String },
    psychological_scores: { type: psychologicalScoresSchema },
    personality_result: { type: personalityResultSchema },
    rank: { 
      type: String, 
      enum: Object.values(USER_RANK),
      default: USER_RANK.BRONZE 
    },
    ranking_score: { type: Number, default: 0 },
    experience: { 
      type: String, 
      enum: Object.values(BUSINESS_EXPERIENCE) 
    },
    positions: [{ 
      type: String, 
      enum: Object.values(COMPANY_POSITION) 
    }],
    is_activated: { type: Boolean, default: false },
    psychological_history: [{ type: psychologicalScoresSchema }],
    personality_history: [{ type: personalityResultSchema }],
  },
  { timestamps: true }
);

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
  hashPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashPassword);
};

// Check if user is activated (mandatory account creation rules)
userSchema.statics.isActivated = async function (id: string): Promise<boolean> {
  const user = await this.findById(id);
  if (!user) return false;
  
  const hasCompanyInfo = (user.vat_number || user.company_id_number) && 
                         user.company_legal_name && 
                         user.company_website;
  const hasTests = user.psychological_scores?.last_taken && 
                   user.personality_result?.last_taken;
                   
  return !!(hasCompanyInfo && hasTests);
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
          new ApiError(StatusCodes.BAD_REQUEST, 'Account already exists!')
        );
      }
    } else if (user.mobile) {
      const isExist = await User.exists({ mobile: user.mobile });
      if (isExist) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, 'Account already exists!')
        );
      }
    }
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );

  next();
});

/* ---------- Middleware ---------- */

userSchema.pre('save', async function (next) {
  const user = this as IUser;

  // Only check for duplicate on create, not on update
  if (this.isNew) {
    if (user.email) {
      const isExist = await User.exists({ email: user.email });
      if (isExist) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, 'Account already exists!')
        );
      }
    } else if (user.mobile) {
      const isExist = await User.exists({ mobile: user.mobile });
      if (isExist) {
        return next(
          new ApiError(StatusCodes.BAD_REQUEST, 'Account already exists!')
        );
      }
    }
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(
    this.password,
    Number(config.bcrypt_salt_rounds)
  );

  next();
});

export const User = model<IUser, UserModel>('User', userSchema);
