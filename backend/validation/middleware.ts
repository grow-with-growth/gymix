import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ValidationError, ValidationResult } from './types';

// Utility function to convert Zod errors to our ValidationError format
export function formatZodErrors(zodError: z.ZodError): ValidationError[] {
  return zodError.errors.map((error) => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code
  }));
}

// Utility function to create standardized error responses
export function createValidationErrorResponse(errors: ValidationError[]): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'Validation failed',
      errors: errors
    },
    { status: 400 }
  );
}

// Generic validation function
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return {
      success: true,
      data: result.data
    };
  } else {
    return {
      success: false,
      errors: formatZodErrors(result.error)
    };
  }
}

// Middleware factory for validating request bodies
export function createValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      // Parse request body
      const body = await request.json();
      
      // Validate the body
      const validationResult = validateData(schema, body);
      
      if (!validationResult.success) {
        return createValidationErrorResponse(validationResult.errors!);
      }
      
      // If validation passes, return null to continue processing
      return null;
    } catch (error) {
      // Handle JSON parsing errors
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON in request body',
          errors: [{
            field: 'body',
            message: 'Request body must be valid JSON',
            code: 'invalid_json'
          }]
        },
        { status: 400 }
      );
    }
  };
}

// Middleware factory for validating query parameters
export function createQueryValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (request: NextRequest): NextResponse | null => {
    try {
      // Extract query parameters
      const url = new URL(request.url);
      const queryParams = Object.fromEntries(url.searchParams.entries());
      
      // Validate the query parameters
      const validationResult = validateData(schema, queryParams);
      
      if (!validationResult.success) {
        return createValidationErrorResponse(validationResult.errors!);
      }
      
      // If validation passes, return null to continue processing
      return null;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          errors: [{
            field: 'query',
            message: 'Invalid query parameters',
            code: 'invalid_query'
          }]
        },
        { status: 400 }
      );
    }
  };
}

// Middleware factory for validating path parameters
export function createPathValidationMiddleware<T>(schema: z.ZodSchema<T>) {
  return (params: Record<string, string>): NextResponse | null => {
    try {
      // Validate the path parameters
      const validationResult = validateData(schema, params);
      
      if (!validationResult.success) {
        return createValidationErrorResponse(validationResult.errors!);
      }
      
      // If validation passes, return null to continue processing
      return null;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid path parameters',
          errors: [{
            field: 'params',
            message: 'Invalid path parameters',
            code: 'invalid_params'
          }]
        },
        { status: 400 }
      );
    }
  };
}

// Higher-order function to wrap API route handlers with validation
export function withValidation<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, validatedData: T, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    try {
      // Parse and validate request body
      const body = await request.json();
      const validationResult = validateData(schema, body);
      
      if (!validationResult.success) {
        return createValidationErrorResponse(validationResult.errors!);
      }
      
      // Call the original handler with validated data
      return await handler(request, validationResult.data!, ...args);
    } catch (error) {
      // Handle JSON parsing errors
      if (error instanceof SyntaxError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid JSON in request body',
            errors: [{
              field: 'body',
              message: 'Request body must be valid JSON',
              code: 'invalid_json'
            }]
          },
          { status: 400 }
        );
      }
      
      // Handle other errors
      console.error('Validation middleware error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Internal server error',
          errors: [{
            field: 'server',
            message: 'An unexpected error occurred',
            code: 'internal_error'
          }]
        },
        { status: 500 }
      );
    }
  };
}

// Utility function for validating data in service layers
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = formatZodErrors(result.error);
    const error = new Error('Validation failed');
    (error as any).validationErrors = errors;
    throw error;
  }
  
  return result.data;
}

// Async version of validateOrThrow for async validation
export async function validateOrThrowAsync<T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): Promise<T> {
  return validateOrThrow(schema, data);
}