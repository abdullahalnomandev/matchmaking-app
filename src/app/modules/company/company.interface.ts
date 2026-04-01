import { Model, Types } from 'mongoose';
import { BUSINESS_AREA, BUSINESS_OBJECT, BUSINESS_TYPE } from '../../../enums/business';

export interface ICompany {
  _id: Types.ObjectId;
  owner: Types.ObjectId;
  legal_name: string;
  vat_number?: string;
  company_id_number?: string;
  website?: string;
  business_object: BUSINESS_OBJECT;
  business_types: BUSINESS_TYPE[];
  business_areas: BUSINESS_AREA[];
  turnover: number;
  image?: string;
  status: 'active' | 'inactive';
}

export type CompanyModel = Model<ICompany>;
