# Frontend API Integration Guide

## Overview

This document explains how the frontend (Vite/React) is configured to communicate with the Express backend API.

## Configuration

### API Endpoints

All API endpoints are configured in `config/api.ts`:

```typescript
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001';

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/api/auth`,
  calendar: `${API_BASE_URL}/api/calendar`,
  gamification: `${API_BASE_URL}/api/gamification`,
  // ... other endpoints
};
```

### Environment Variables

Set the API URL in your `.env` file:

```env
VITE_API_URL=http://localhost:3001
```

For production, update this to your backend server URL.

## Making API Calls

### Using the API Helper

The `utils/api-helper.ts` provides consistent methods for API calls:

```typescript
import { api, getApiUrl } from '../utils/api-helper';
import { API_ENDPOINTS } from '../config/api';

// GET request
const data = await api.get(API_ENDPOINTS.calendar);

// POST request
const newEvent = await api.post(API_ENDPOINTS.calendar, {
  title: 'New Event',
  date: '2024-01-28'
});

// With URL parameters
const events = await api.get(API_ENDPOINTS.calendar, {
  year: '2024',
  month: '1'
});
```

### Direct Fetch Calls

For direct fetch calls, always use the configured endpoints:

```typescript
import { API_ENDPOINTS } from '../config/api';

const response = await fetch(`${API_ENDPOINTS.gamification}/achievements`, {
  credentials: 'include', // Important for cookies
  headers: {
    'Content-Type': 'application/json'
  }
});
```

## Authentication

- All API calls include `credentials: 'include'` to send cookies
- The backend uses JWT tokens stored in HTTP-only cookies
- CORS is configured to allow credentials from the frontend URL

## Updated Hooks

The following hooks have been updated to use the configured API endpoints:

1. **useGamification.ts** - Gamification features
2. **useMoodFocusCheckIn.ts** - Mood and focus tracking
3. **UserContext.tsx** - Authentication and user management

### Example: useGamification Hook

```typescript
import { API_ENDPOINTS } from '../config/api';

// Before (incorrect)
const response = await fetch('/api/gamification/achievements');

// After (correct)
const response = await fetch(`${API_ENDPOINTS.gamification}/achievements`);
```

## CORS Configuration

The Express backend is configured to accept requests from the frontend:

```typescript
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

## Common Issues and Solutions

### Issue: API calls returning 404

**Solution**: Ensure all API calls use the full URL from `API_ENDPOINTS`, not relative paths like `/api/...`

### Issue: Authentication not working

**Solution**: 
1. Check that `credentials: 'include'` is set in fetch options
2. Verify CORS configuration allows your frontend URL
3. Ensure cookies are being set and sent properly

### Issue: Environment variable not working

**Solution**: 
1. Restart the Vite dev server after changing `.env`
2. Use `VITE_` prefix for all Vite environment variables
3. Access with `import.meta.env.VITE_API_URL` in code

## Migration Checklist

When updating API calls in components or hooks:

- [ ] Import `API_ENDPOINTS` from `'../config/api'`
- [ ] Replace all `/api/...` paths with `${API_ENDPOINTS.service}/...`
- [ ] Ensure `credentials: 'include'` is set for authenticated requests
- [ ] Test the API call works with the Express backend
- [ ] Handle errors appropriately

## Development Workflow

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend dev server:
   ```bash
   npm run dev
   ```

3. The frontend will automatically proxy API calls to `http://localhost:3001`

## Production Deployment

1. Set the production API URL:
   ```env
   VITE_API_URL=https://api.yourdomain.com
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

3. Deploy the built files to your hosting service

## Next Steps

To complete the frontend integration:

1. Update all remaining hooks and components to use `API_ENDPOINTS`
2. Remove any Next.js specific code or imports
3. Ensure all API routes in the backend are properly implemented
4. Test all features with the Express backend

