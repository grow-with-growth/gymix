// Example usage of validation middleware in API routes
import { NextRequest, NextResponse } from 'next/server';
import { 
  userCreateSchema, 
  userUpdateSchema, 
  calendarEventCreateSchema,
  messageCreateSchema 
} from './schemas';
import { 
  withValidation, 
  createValidationMiddleware,
  createQueryValidationMiddleware 
} from './middleware';
import { paginationSchema, idSchema } from './utils';

// Example 1: Using withValidation HOF for user creation
export const createUserHandler = withValidation(
  userCreateSchema,
  async (request: NextRequest, validatedData) => {
    // validatedData is now typed and validated
    console.log('Creating user:', validatedData);
    
    // Your business logic here
    // const user = await userService.create(validatedData);
    
    return NextResponse.json({
      success: true,
      data: validatedData,
      message: 'User created successfully'
    });
  }
);

// Example 2: Using validation middleware manually
export async function updateUserHandler(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Validate path parameters
  const pathValidation = createValidationMiddleware(idSchema);
  const pathError = await pathValidation(request);
  if (pathError) return pathError;
  
  // Validate request body
  const bodyValidation = createValidationMiddleware(userUpdateSchema);
  const bodyError = await bodyValidation(request);
  if (bodyError) return bodyError;
  
  // If we get here, validation passed
  const body = await request.json();
  
  console.log('Updating user:', params.id, body);
  
  return NextResponse.json({
    success: true,
    data: { id: params.id, ...body },
    message: 'User updated successfully'
  });
}

// Example 3: Using query parameter validation
export async function getUsersHandler(request: NextRequest) {
  // Validate query parameters
  const queryValidation = createQueryValidationMiddleware(paginationSchema);
  const queryError = queryValidation(request);
  if (queryError) return queryError;
  
  // Extract validated query parameters
  const url = new URL(request.url);
  const queryParams = Object.fromEntries(url.searchParams.entries());
  const { page = 1, limit = 10 } = paginationSchema.parse(queryParams);
  
  console.log('Getting users with pagination:', { page, limit });
  
  return NextResponse.json({
    success: true,
    data: [],
    pagination: { page, limit },
    message: 'Users retrieved successfully'
  });
}

// Example 4: Calendar event creation with validation
export const createCalendarEventHandler = withValidation(
  calendarEventCreateSchema,
  async (request: NextRequest, validatedData) => {
    console.log('Creating calendar event:', validatedData);
    
    return NextResponse.json({
      success: true,
      data: { id: 'generated-id', ...validatedData },
      message: 'Calendar event created successfully'
    });
  }
);

// Example 5: Message creation with validation
export const createMessageHandler = withValidation(
  messageCreateSchema,
  async (request: NextRequest, validatedData) => {
    console.log('Creating message:', validatedData);
    
    return NextResponse.json({
      success: true,
      data: { id: Date.now(), ...validatedData },
      message: 'Message created successfully'
    });
  }
);

// Example 6: Error handling in validation
export async function exampleErrorHandling(request: NextRequest) {
  try {
    const body = await request.json();
    
    // This will throw if validation fails
    const validatedData = userCreateSchema.parse(body);
    
    return NextResponse.json({
      success: true,
      data: validatedData
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        errors: error.errors.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}