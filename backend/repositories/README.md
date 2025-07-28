# Repository Pattern Implementation

This directory contains the repository pattern implementation for the GROW YouR NEED SaaS School Provider platform.

## Overview

The repository pattern provides an abstraction layer between the business logic (services) and data access logic (database operations). This implementation includes:

- **Repository Interfaces**: Define contracts for data operations
- **PocketBase Repositories**: Concrete implementations using PocketBase
- **Service Layer**: Business logic that uses repositories
- **Service Container**: Dependency injection container

## Structure

```
repositories/
├── interfaces.ts              # Repository interface definitions
├── pocketbase/
│   ├── userRepository.ts     # User repository implementation
│   └── calendarRepository.ts # Calendar repository implementation
├── index.ts                  # Repository exports
└── README.md                 # This file
```

## Usage

### 1. Using Services (Recommended)

The easiest way to use the repository pattern is through the service layer:

```typescript
import { getServiceContainer } from '../db';

// Get service container
const serviceContainer = getServiceContainer();

// Use user service
const userService = serviceContainer.getUserService();
const users = await userService.getAllUsers();

// Use calendar service
const calendarService = serviceContainer.getCalendarService();
const events = await calendarService.getAllEvents();
```

### 2. Using Repositories Directly

You can also use repositories directly if needed:

```typescript
import { getServiceContainer } from '../db';

// Get service container
const serviceContainer = getServiceContainer();

// Use user repository directly
const userRepository = serviceContainer.getUserRepository();
const user = await userRepository.findById('user-id');

// Use calendar repository directly
const calendarRepository = serviceContainer.getCalendarRepository();
const events = await calendarRepository.findByMonth(2024, 3);
```

### 3. In API Routes

Example usage in Next.js API routes:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServiceContainer } from '../backend/db';

export async function GET(request: NextRequest) {
  try {
    const serviceContainer = getServiceContainer();
    if (!serviceContainer) {
      return NextResponse.json({ error: 'Service not available' }, { status: 500 });
    }

    const userService = serviceContainer.getUserService();
    const users = await userService.getAllUsers();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}
```

## Repository Interfaces

### BaseRepository<T>

All repositories extend this base interface:

```typescript
interface BaseRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Omit<T, 'id'>): Promise<T>;
  update(id: string, item: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

### UserRepository

Extends BaseRepository with user-specific methods:

```typescript
interface UserRepository extends BaseRepository<SchoolUser> {
  findByEmail(email: string): Promise<SchoolUser | null>;
  findByRole(role: SchoolUser['role']): Promise<SchoolUser[]>;
  findByDepartment(department: string): Promise<SchoolUser[]>;
  authenticate(email: string, password: string): Promise<SchoolUser | null>;
}
```

### CalendarRepository

Extends BaseRepository with calendar-specific methods:

```typescript
interface CalendarRepository extends BaseRepository<CalendarEvent> {
  findByDateRange(startDate: string, endDate: string): Promise<CalendarEvent[]>;
  findByMonth(year: number, month: number): Promise<CalendarEvent[]>;
  findByType(type: CalendarEvent['type']): Promise<CalendarEvent[]>;
  findByUser(userId: string): Promise<CalendarEvent[]>;
}
```

## Service Layer

Services provide business logic and validation on top of repositories:

### UserService

```typescript
const userService = serviceContainer.getUserService();

// Get all users
const users = await userService.getAllUsers();

// Create user with validation
const newUser = await userService.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  role: 'Student',
  department: 'Computer Science'
});

// Get user statistics
const stats = await userService.getUsersStatistics();
```

### CalendarService

```typescript
const calendarService = serviceContainer.getCalendarService();

// Get events by date range with validation
const events = await calendarService.getEventsByDateRange('2024-03-01', '2024-03-31');

// Create event with business logic validation
const newEvent = await calendarService.createEvent({
  title: 'Team Meeting',
  date: '2024-03-15',
  type: 'meeting',
  description: 'Weekly team sync'
});

// Get upcoming events
const upcoming = await calendarService.getUpcomingEvents(7);
```

## Error Handling

All repositories and services include comprehensive error handling:

- **Validation Errors**: Using Zod schemas for data validation
- **Not Found Errors**: Proper 404 handling for missing resources
- **Database Errors**: Wrapped PocketBase errors with user-friendly messages
- **Business Logic Errors**: Service-level validation and error messages

## Testing

To test repositories and services:

```typescript
import { PocketBaseUserRepository } from './pocketbase/userRepository';
import { UserService } from '../services/userService';

// Mock PocketBase for testing
const mockPb = {
  collection: jest.fn(),
  // ... other mock methods
};

// Test repository
const userRepository = new PocketBaseUserRepository(mockPb as any);
const user = await userRepository.findById('test-id');

// Test service
const userService = new UserService(userRepository);
const users = await userService.getAllUsers();
```

## Benefits

1. **Separation of Concerns**: Business logic separated from data access
2. **Testability**: Easy to mock repositories for unit testing
3. **Flexibility**: Can switch database implementations without changing business logic
4. **Consistency**: Standardized data access patterns across the application
5. **Validation**: Centralized data validation using Zod schemas
6. **Error Handling**: Consistent error handling and user-friendly messages

## Adding New Repositories

To add a new repository:

1. Define the interface in `interfaces.ts`
2. Create the PocketBase implementation in `pocketbase/`
3. Add validation schemas in `../validation/schemas.ts`
4. Create a service class in `../services/`
5. Update the service container
6. Export from `index.ts`

Example:

```typescript
// 1. Define interface
interface ProductRepository extends BaseRepository<Product> {
  findByCategory(category: string): Promise<Product[]>;
}

// 2. Implement repository
class PocketBaseProductRepository implements ProductRepository {
  // Implementation...
}

// 3. Create service
class ProductService {
  constructor(private productRepository: ProductRepository) {}
  // Business logic...
}

// 4. Update service container
class ServiceContainer {
  getProductService(): ProductService {
    return new ProductService(this.getProductRepository());
  }
}
```