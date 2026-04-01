import { model, Schema } from 'mongoose';
import { BUSINESS_AREA, BUSINESS_OBJECT, BUSINESS_TYPE } from '../../../enums/business';
import { CompanyModel, ICompany } from './company.interface';

const companySchema = new Schema<ICompany, CompanyModel>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    legal_name: {
      type: String,
      required: true,
    },
    vat_number: {
      type: String,
    },
    company_id_number: {
      type: String,
    },
    website: {
      type: String,
    },
    business_object: {
      type: String,
      enum: Object.values(BUSINESS_OBJECT),
      required: true,
    },
    business_types: [{
      type: String,
      enum: Object.values(BUSINESS_TYPE),
      required: true,
    }],
    business_areas: [{
      type: String,
      enum: Object.values(BUSINESS_AREA),
      required: true,
    }],
    turnover: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const Company = model<ICompany, CompanyModel>('Company', companySchema);
