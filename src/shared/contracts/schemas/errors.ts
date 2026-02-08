import { z } from 'zod';
import { ERROR_CODES } from '../constants';

const validationIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string(),
  code: z.string().optional(),
});

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.enum([
      ERROR_CODES.VALIDATION_ERROR,
      ERROR_CODES.UNAUTHORIZED,
      ERROR_CODES.FORBIDDEN,
      ERROR_CODES.NOT_FOUND,
      ERROR_CODES.CONFLICT,
      ERROR_CODES.INTERNAL,
    ]),
    message: z.string(),
    details: z.array(validationIssueSchema).optional(),
    requestId: z.string(),
  }),
});

export type ValidationIssue = z.infer<typeof validationIssueSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
