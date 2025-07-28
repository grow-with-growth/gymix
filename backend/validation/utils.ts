import { z } from 'zod';
import { ValidationError } from './types';

// Common validation schemas for reuse
export const idSchema = z.object({
  id: z.string().min(1, 'ID is required')
});

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/, 'Page must be a number').transform(Number).optional(),
  limit: z.string().regex(/^\d+$/, 'Limit must be a number').transform(Number).optional(),
  offset: z.string().regex(/^\d+$/, 'Offset must be a number').transform(Number).optional()
});

export const searchSchema = z.object({
  q: z.string().min(1, 'Search query is required').optional(),
  category: z.string().optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  sortBy: z.string().optional()
});

// Utility to create custom validation error
export function createValidationError(
  field: string, 
  message: string, 
  code: string = 'custom_validation'
): ValidationError {
  return { field, message, code };
}

// Utility to validate email format more strictly
export const strictEmailSchema = z.string()
  .email('Invalid email format')
  .refine((email) => {
    // Additional email validation rules
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }, 'Email format is not valid')
  .refine((email) => {
    // Check for common disposable email domains
    const disposableDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    return !disposableDomains.includes(domain);
  }, 'Disposable email addresses are not allowed');

// Utility to validate password strength
export const strongPasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .max(128, 'Password must not exceed 128 characters')
  .refine((password) => /[a-z]/.test(password), 'Password must contain at least one lowercase letter')
  .refine((password) => /[A-Z]/.test(password), 'Password must contain at least one uppercase letter')
  .refine((password) => /\d/.test(password), 'Password must contain at least one number')
  .refine((password) => /[!@#$%^&*(),.?":{}|<>]/.test(password), 'Password must contain at least one special character')
  .refine((password) => !/(.)\1{2,}/.test(password), 'Password must not contain repeated characters');

// Utility to validate file uploads
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimetype: z.string().min(1, 'File type is required'),
  size: z.number().min(1, 'File size must be greater than 0').max(10 * 1024 * 1024, 'File size must not exceed 10MB')
});

// Utility to validate date ranges
export const dateRangeSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format')
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, 'End date must be after or equal to start date');

// Utility to validate time format
export const timeSchema = z.string().regex(
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Time must be in HH:MM format (24-hour)'
);

// Utility to validate phone numbers
export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .min(10, 'Phone number must be at least 10 digits')
  .max(20, 'Phone number must not exceed 20 characters');

// Utility to validate URLs
export const urlSchema = z.string()
  .url('Invalid URL format')
  .refine((url) => {
    try {
      const parsedUrl = new URL(url);
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }, 'URL must use HTTP or HTTPS protocol');

// Utility to create conditional validation
export function createConditionalSchema<T>(
  condition: (data: any) => boolean,
  trueSchema: z.ZodSchema<T>,
  falseSchema: z.ZodSchema<T>
): z.ZodSchema<T> {
  return z.any().superRefine((data, ctx) => {
    const schema = condition(data) ? trueSchema : falseSchema;
    const result = schema.safeParse(data);
    
    if (!result.success) {
      result.error.errors.forEach((error) => {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: error.path,
          message: error.message
        });
      });
    }
  }) as z.ZodSchema<T>;
}