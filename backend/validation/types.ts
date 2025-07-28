import { z } from 'zod';

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: ValidationError[];
}

// Base validation response
export interface ValidationResponse {
  success: boolean;
  errors?: ValidationError[];
}

// Utility type for Zod schema validation
export type ZodValidationResult<T> = z.SafeParseReturnType<any, T>;