import { Types } from 'mongoose';
import { 
  BUSINESS_OBJECT, 
  BUSINESS_TYPE, 
  BUSINESS_EXPERIENCE, 
  COMPANY_POSITION 
} from '../../../enums/business';

export interface ICompany {
  _id?: Types.ObjectId;
  owner: Types.ObjectId; // Reference to user who owns this company
  
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
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICompanyFilters {
  search?: string;
  business_object?: BUSINESS_OBJECT;
  business_types?: BUSINESS_TYPE;
  business_area?: string;
  experience?: BUSINESS_EXPERIENCE;
  positions?: COMPANY_POSITION;
  annual_turnover?: string;
  country?: string;
  isVerified?: boolean;
  isActive?: boolean;
  owner?: string;
  page?: number;
  limit?: number;
}
