import { z } from 'zod';
import { BUSINESS_AREA, BUSINESS_OBJECT, BUSINESS_TYPE } from '../../../enums/business';

const createCompanyZodSchema = z.object({
  body: z.object({
    legal_name: z.string({ required_error: 'Legal name is required' }),
    vat_number: z.string().optional(),
    company_id_number: z.string().optional(),
    website: z.string().url().optional(),
    business_object: z.nativeEnum(BUSINESS_OBJECT, { required_error: 'Business object is required' }),
    business_types: z.array(z.nativeEnum(BUSINESS_TYPE), { required_error: 'Business types are required' }),
    business_areas: z.array(z.nativeEnum(BUSINESS_AREA), { required_error: 'Business areas are required' }),
    turnover: z.number().min(0).optional(),
    image: z.string().optional(),
  }),
});

const updateCompanyZodSchema = z.object({
  body: z.object({
    legal_name: z.string().optional(),
    vat_number: z.string().optional(),
    company_id_number: z.string().optional(),
    website: z.string().url().optional(),
    business_object: z.nativeEnum(BUSINESS_OBJECT).optional(),
    business_types: z.array(z.nativeEnum(BUSINESS_TYPE)).optional(),
    business_areas: z.array(z.nativeEnum(BUSINESS_AREA)).optional(),
    turnover: z.number().min(0).optional(),
    image: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional(),
  }),
});

export const CompanyValidation = {
  createCompanyZodSchema,
  updateCompanyZodSchema,
};
