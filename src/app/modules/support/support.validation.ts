import { z } from 'zod';
import { SUPPORT_AREA } from '../../../enums/business';

const createSupportRequestZodSchema = z.object({
  body: z.object({
    area: z.nativeEnum(SUPPORT_AREA),
    description: z.string(),
    mode: z.enum(['chat', 'on_demand', 'meeting']),
    meeting_date: z.coerce.date().optional(),
  }),
});

const updateSupportRequestStatusZodSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'accepted', 'completed', 'cancelled']),
  }),
});

export const SupportValidation = {
  createSupportRequestZodSchema,
  updateSupportRequestStatusZodSchema,
};
