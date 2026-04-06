import { z } from 'zod';
import { BUSINESS_EXPERIENCE, COMPANY_POSITION, USER_RANK } from '../../../enums/business';

const createUserZodSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }),
    email: z.string({ required_error: 'Email is required' }).email('Invalid email format'),
    mobile: z.string().optional(),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string().optional(),
    role: z.enum(['super_admin', 'admin', 'business_user', 'support_partner']).optional(),
    
    // Company / Business Info
    company_legal_name: z.string().optional(),
    company_location: z.string().optional(),
    company_website: z.string().optional(),
    country: z.string().optional(),
    vat_number: z.string().optional(),
    company_id_number: z.string().optional(),
    business_object: z.string().optional(),
    business_types: z.array(z.string()).optional(),
    business_area: z.string().optional(),
    experience: z.string().optional(),
    positions: z.string().optional(),
    annual_turnover: z.string().optional(),
  }),
});

const updateUserZodSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email('Invalid email format').optional(),
    mobile: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').optional(),
    role: z.enum(['super_admin', 'admin', 'business_user', 'support_partner']).optional(),
    rank: z.nativeEnum(USER_RANK).optional(),
    status: z.enum(['active', 'delete']).optional(),
    verified: z.boolean().optional(),
    image: z.string().optional(),
    location: z.string().optional(),
    about: z.string().optional(),
    
    // New fields from BRD
    vat_number: z.string().optional(),
    company_id_number: z.string().optional(),
    company_name: z.string().optional(),
    company_legal_name: z.string().optional(),
    company_website: z.string().optional(),
    
    experience: z.nativeEnum(BUSINESS_EXPERIENCE).optional(),
    positions: z.nativeEnum(COMPANY_POSITION).optional(),
    business_types: z.array(z.string()).optional(),
  }),
});

const updatePsychologicalScoresZodSchema = z.object({
  body: z.object({
    accountability: z.number().min(0).max(100),
    emotional_stability: z.number().min(0).max(100),
    conflict_management: z.number().min(0).max(100),
    impulsivity: z.number().min(0).max(100),
    ethics_rule_adherence: z.number().min(0).max(100),
    stress_tolerance: z.number().min(0).max(100),
    long_term_commitment: z.number().min(0).max(100),
    transparency_honesty: z.number().min(0).max(100),
  }),
});

const updatePersonalityResultZodSchema = z.object({
  body: z.object({
    mbti_type: z.string(),
    big_five: z.object({
      openness: z.number().min(0).max(100),
      conscientiousness: z.number().min(0).max(100),
      extraversion: z.number().min(0).max(100),
      agreeableness: z.number().min(0).max(100),
      emotional_stability: z.number().min(0).max(100),
    }),
  }),
});

export const UserValidation = {
  createUserZodSchema,
  updateUserZodSchema,
  updatePsychologicalScoresZodSchema,
  updatePersonalityResultZodSchema,
};
