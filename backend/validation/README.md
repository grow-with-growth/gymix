# Data Validation Layer

This directory contains the comprehensive data validation layer for the GROW YouR NEED SaaS School Provider platform. The validation layer uses Zod for schema validation and provides middleware for API routes.

## Features

- **Type-safe validation** using Zod schemas
- **Standardized error responses** with detailed error information
- **Middleware functions** for easy integration with Next.js API routes
- **Utility functions** for common validation patterns
- **Comprehensive schemas** for all data models

## Directory Structure

```
src/backend/validation/
├── index.ts          # Main exports
├── types.ts          # TypeScript types for validation
├── schemas.ts        # Zod validation schemas
├── middleware.ts     # Validation middleware functions
├── utils.ts          # Utility functions and common schemas
├── examples.ts       # Usage examples
└── README.md         # This file
```

## Quick Start

### 1. Import validation schemas and middleware

```typescript
import { 
  userCreateSchema, 
  withValidation,
  createValidationMiddleware 
} from '@/backend/validation';
```

### 2. Use with API routes

#### Method 1: Using withValidation HOF (Recommended)

```typescript
import { withValidation, userCreateSchema } from '@/backend/validation';

export const POST = withValidation(
  userCreateSchema,
  async (request, validatedData) => {
    // validatedData is typed and validated
    const user = await userService.create(validatedData);
    
    return NextResponse.json({
      success: true,
      data: user
    });
  }
);
```

#### Method 2: Using middleware manually

```typescript
import { createValidationMiddleware, userCreateSchema } from '@/backend/validation';

export async function POST(request: NextRequest) {
  const validation = createValidationMiddleware(userCreateSchema);
  const error = await validation(request);
  
  if (error) return error; // Returns validation error response
  
  const body = await request.json();
  // Process validated data...
}
```

### 3. Validate data in service layers

```typescript
import { validateOrThrow, userCreateSchema } from '@/backend/validation';

export class UserService {
  async createUser(userData: unknown) {
    // This will throw if validation fails
    const validatedData = validateOrThrow(userCreateSchema, userData);
    
    // Process validated data...
    return await this.repository.create(validatedData);
  }
}
```

## Available Schemas

### Core Schemas

- `userSchema` - User data validation
- `userCreateSchema` - User creation (password required)
- `userUpdateSchema` - User updates (all fields optional)
- `calendarEventSchema` - Calendar event validation
- `calendarEventCreateSchema` - Calendar event creation
- `calendarEventUpdateSchema` - Calendar event updates
- `messageSchema` - Message validation
- `messageCreateSchema` - Message creation
- `messageUpdateSchema` - Message updates
- `knowledgeArticleSchema` - Knowledge base article validation
- `marketplaceProductSchema` - Marketplace product validation
- `gameSchema` - Game validation
- `mediaContentSchema` - Media content validation

### Utility Schemas

- `idSchema` - ID parameter validation
- `paginationSchema` - Pagination parameters
- `searchSchema` - Search parameters
- `dateRangeSchema` - Date range validation
- `fileUploadSchema` - File upload validation
- `strictEmailSchema` - Strict email validation
- `strongPasswordSchema` - Strong password validation
- `phoneSchema` - Phone number validation
- `urlSchema` - URL validation

## Middleware Functions

### `withValidation(schema, handler)`

Higher-order function that wraps API route handlers with validation.

```typescript
export const POST = withValidation(userCreateSchema, async (request, validatedData) => {
  // Handler receives validated data as second parameter
});
```

### `createValidationMiddleware(schema)`

Creates middleware for validating request bodies.

```typescript
const validation = createValidationMiddleware(userCreateSchema);
const error = await validation(request);
if (error) return error;
```

### `createQueryValidationMiddleware(schema)`

Creates middleware for validating query parameters.

```typescript
const validation = createQueryValidationMiddleware(paginationSchema);
const error = validation(request);
if (error) return error;
```

### `createPathValidationMiddleware(schema)`

Creates middleware for validating path parameters.

```typescript
const validation = createPathValidationMiddleware(idSchema);
const error = validation(params);
if (error) return error;
```

## Utility Functions

### `validateData(schema, data)`

Validates data and returns a result object.

```typescript
const result = validateData(userCreateSchema, userData);
if (result.success) {
  console.log('Valid data:', result.data);
} else {
  console.log('Validation errors:', result.errors);
}
```

### `validateOrThrow(schema, data)`

Validates data and throws an error if validation fails.

```typescript
try {
  const validatedData = validateOrThrow(userCreateSchema, userData);
  // Process validated data...
} catch (error) {
  // Handle validation error
  console.log('Validation errors:', error.validationErrors);
}
```

### `formatZodErrors(zodError)`

Converts Zod errors to standardized ValidationError format.

```typescript
const errors = formatZodErrors(zodError);
```

### `createValidationErrorResponse(errors)`

Creates a standardized error response for validation failures.

```typescript
return createValidationErrorResponse(validationErrors);
```

## Error Response Format

All validation errors return a standardized format:

```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "invalid_string"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long",
      "code": "too_small"
    }
  ]
}
```

## Custom Validation

### Creating Custom Schemas

```typescript
import { z } from 'zod';

const customSchema = z.object({
  customField: z.string()
    .min(1, 'Custom field is required')
    .refine((value) => {
      // Custom validation logic
      return value !== 'forbidden';
    }, 'Custom field cannot be "forbidden"')
});
```

### Adding Custom Validation Rules

```typescript
const emailSchema = z.string()
  .email('Invalid email format')
  .refine((email) => {
    // Custom domain validation
    const allowedDomains = ['company.com', 'school.edu'];
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain);
  }, 'Email must be from an allowed domain');
```

## Testing

The validation layer can be tested using Jest:

```typescript
import { validateData, userCreateSchema } from '@/backend/validation';

describe('User Validation', () => {
  it('should validate correct user data', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      role: 'Student',
      department: 'Computer Science'
    };
    
    const result = validateData(userCreateSchema, userData);
    expect(result.success).toBe(true);
    expect(result.data).toEqual(userData);
  });
  
  it('should reject invalid email', () => {
    const userData = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'SecurePass123',
      role: 'Student',
      department: 'Computer Science'
    };
    
    const result = validateData(userCreateSchema, userData);
    expect(result.success).toBe(false);
    expect(result.errors).toContainEqual({
      field: 'email',
      message: 'Invalid email format',
      code: 'invalid_string'
    });
  });
});
```

## Best Practices

1. **Always validate at API boundaries** - Use validation middleware for all API routes
2. **Use type-safe schemas** - Leverage TypeScript types generated from Zod schemas
3. **Provide clear error messages** - Write descriptive validation error messages
4. **Validate early** - Validate data as soon as it enters your system
5. **Use appropriate schemas** - Use create/update specific schemas when needed
6. **Handle errors gracefully** - Always handle validation errors appropriately
7. **Test validation logic** - Write tests for your validation schemas
8. **Document custom rules** - Document any custom validation logic clearly

## Integration with Existing Code

The validation layer is designed to integrate seamlessly with the existing codebase:

1. **API Routes** - Use validation middleware in Next.js API routes
2. **Service Layer** - Use `validateOrThrow` in service classes
3. **Repository Layer** - Validate data before database operations
4. **Frontend Forms** - Use the same schemas for client-side validation
5. **Testing** - Use schemas in test data generation and validation

## Performance Considerations

- Zod validation is fast and efficient
- Schemas are compiled once and reused
- Validation happens synchronously
- Memory usage is minimal
- Consider caching validation results for repeated validations of the same data

## Future Enhancements

- Add support for async validation (e.g., database uniqueness checks)
- Implement validation caching for performance optimization
- Add support for conditional validation based on user roles
- Integrate with OpenAPI/Swagger for automatic API documentation
- Add support for custom validation error translations