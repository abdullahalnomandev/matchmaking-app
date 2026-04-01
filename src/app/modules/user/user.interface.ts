import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';
import { PROFILE_MODE } from './user.constant';
import { BUSINESS_EXPERIENCE, COMPANY_POSITION, USER_RANK } from '../../../enums/business';

export interface IPsychologicalScores {
  accountability: number;
  emotional_stability: number;
  conflict_management: number;
  impulsivity: number;
  ethics_rule_adherence: number;
  stress_tolerance: number;
  long_term_commitment: number;
  transparency_honesty: number;
  last_taken: Date;
}

export interface IPersonalityResult {
  mbti_type: string;
  big_five: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    emotional_stability: number;
  };
  last_taken: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  mobile?: string;
  confirm_password?: string;
  password: string;
  role: USER_ROLES;
  canAccessFeature: boolean;
  status: 'active' | 'delete';
  verified: boolean;
  profile_mode: PROFILE_MODE;
  image: string;
  token?: string;
  authorization?: {
    oneTimeCode: string;
    expireAt: Date;
  };

  // New fields from BRD
  vat_number?: string;
  company_id_number?: string;
  company_legal_name?: string;
  company_website?: string;
  
  psychological_scores?: IPsychologicalScores;
  personality_result?: IPersonalityResult;
  rank: USER_RANK;
  ranking_score: number;
  
  experience?: BUSINESS_EXPERIENCE;
  positions: COMPANY_POSITION[];
  
  location?: string;
  about?: string;
  preferences?: string[];
  
  is_activated: boolean;
  
  psychological_history: IPsychologicalScores[];
  personality_history: IPersonalityResult[];
}

export interface UserModel extends Model<IUser> {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
  isActivated(id: string): Promise<boolean>;
}
