import { Schema, model, Types } from 'mongoose';
import { ICompany } from './company.interface';
import {
  BUSINESS_OBJECT,
  BUSINESS_TYPE,
  BUSINESS_EXPERIENCE,
  COMPANY_POSITION,
} from '../../../enums/business';

const companySchema = new Schema<ICompany>(
  {
    // Company / Business Info
    owner : { type: Schema.Types.ObjectId, ref: 'User' },
    company_name: { type: String },
    company_legal_name: { type: String },
    company_location: { type: String },
    company_website: { type: String },
    country: { type: String },
    vat_number: { type: String },
    company_id_number: { type: String },
    business_object: { type: String, enum: Object.values(BUSINESS_OBJECT) },
    business_types: [{ type: String, enum: Object.values(BUSINESS_TYPE) }],
    business_area: { type: String },
    experience: { type: String, enum: Object.values(BUSINESS_EXPERIENCE) },
    positions: { type: String, enum: Object.values(COMPANY_POSITION) },
    annual_turnover: {
      type: String,
      enum: ['0_100k', '100k_500k', '500k_1m', '1m_5m', '5m_plus'],
    },
  },
  { timestamps: true },
);


export const Company = model<ICompany>('Company', companySchema);
