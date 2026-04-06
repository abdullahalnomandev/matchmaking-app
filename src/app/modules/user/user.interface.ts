import { Model, Types } from 'mongoose';

export interface IPersonalityResult {
  scores: Record<string, number>;
  last_taken: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  mobile?: string;
  confirm_password?: string;
  password: string;
  role: 'business_user' | 'support_partner';
  canAccessFeature: boolean;
  status: 'active' | 'delete';
  verified: boolean;
  image?: string;
  token?: string;
  authorization?: {
    oneTimeCode: string;
    expireAt: Date;
  };

  // Company / Business Info
  company_name?: string;
  company_legal_name?: string;
  company_location?: string;
  company_website?: string;
  country?: string;
  vat_number?: string;
  company_id_number?: string;
  business_object?: 'products' | 'services' | 'products_and_services';
  business_types?: ('B2B' | 'B2C' | 'B2G')[];
  business_area?: string;
  experience?:
    | 'zero_two'
    | 'three_five'
    | 'six_ten'
    | 'eleven_twenty'
    | 'twenty_plus';
  positions?: string;
  annual_turnover?: '0_100k' | '100k_500k' | '500k_1m' | '1m_5m' | '5m_plus';

  // Psychological & Personality (latest only)
  psychological_scores?: Record<string, number>;
  personality_scores?: Record<string, number>;
  mbti_type?: string;

  // Ranking
  ranking_score?: {
    psychological: number;
    personality: number;
    experience: number;
    turnover: number;
    activity: number;
  };

  // Optional
  is_activated?: boolean;
}

export interface UserModel extends Model<IUser> {
  isExistUserById(id: string): Promise<IUser | null>;
  isExistUserByEmail(email: string): Promise<IUser | null>;
  isMatchPassword(password: string, hashPassword: string): Promise<boolean>;
  isActivated(id: string): Promise<boolean>;
}
