import { z } from 'zod';

// Create consultation request validation
const createConsultationRequestValidationSchema = z.object({
  consultation: z.string().min(1, 'Consultation ID is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium')
});

// Update consultation request validation
const updateConsultationRequestValidationSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
}).refine(data => data.status !== undefined || data.priority !== undefined, {
  message: 'At least one field (status or priority) must be provided for update'
});

// Query parameters validation
const consultationRequestQueryValidationSchema = z.object({
  consultation: z.string().optional(),
  request_user: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  page: z.string().transform(Number).pipe(z.number().min(1).default(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100).default(10)).optional(),
  sortBy: z.string().optional()
});

export const ConsultationRequestValidation = {
  createConsultationRequestValidationSchema,
  updateConsultationRequestValidationSchema,
  consultationRequestQueryValidationSchema
};
