# Gymix Project Migration Tasks

## Overview
This document outlines all tasks required to migrate from the mixed Vite/Next.js structure to a clean Vite frontend + Express backend architecture.

## Current State Analysis

### Frontend Structure (`/api` folder)
```
/api
├── ai/
│   ├── generate/route.ts
│   └── knowledge-search/route.ts
├── ai-mentor/route.ts
├── auth/route.ts
├── calendar/
│   ├── route.ts
│   ├── recurrence-pattern/
│   │   ├── route.ts
│   │   └── bulk/route.ts
│   ├── series/[seriesId]/route.ts
│   └── [id]/route.ts
├── classes/
│   ├── route.ts
│   └── [classId]/enrollments/route.ts
├── email/
│   └── send/route.ts
├── emails/route.ts
├── enrollment-statuses/route.ts
├── games/route.ts
├── gamification/
│   ├── achievements/
│   │   ├── route.ts
│   │   └── unlock/route.ts
│   ├── goals/
│   │   ├── route.ts
│   │   ├── [goalId]/
│   │   │   ├── route.ts
│   │   │   ├── can-complete/route.ts
│   │   │   ├── complete/route.ts
│   │   │   ├── dependencies/route.ts
│   │   │   ├── milestones/[milestoneId]/complete/route.ts
│   │   │   └── progress/route.ts
│   ├── milestones/
│   │   ├── route.ts
│   │   └── check/route.ts
│   ├── progress/route.ts
│   ├── summary/route.ts
│   └── tokens/
│       ├── balance/route.ts
│       ├── earning-rules/route.ts
│       ├── purchase/route.ts
│       ├── spending-options/route.ts
│       └── transactions/route.ts
├── image/route.ts
├── journal/
│   ├── route.ts
│   ├── analytics/route.ts
│   └── export/route.ts
├── learning-guide/
│   ├── analytics/route.ts
│   ├── assessment/route.ts
│   ├── content-suggestions/route.ts
│   ├── objectives/route.ts
│   ├── pathways/
│   │   ├── route.ts
│   │   ├── active/route.ts
│   │   ├── generate/route.ts
│   │   ├── [id]/
│   │   │   ├── route.ts
│   │   │   └── adapt/route.ts
│   ├── progress/route.ts
│   └── recommendations/route.ts
├── marketplace-products/route.ts
├── media/route.ts
├── messages/[messageId]/read/route.ts
├── mindfulness/route.ts
├── mood-focus-checkin/route.ts
├── school-hub-dashboard/route.ts
├── school-users/route.ts
├── search/route.ts
├── study-playlist/route.ts
├── study-sessions/route.ts
├── threads/
│   ├── route.ts
│   ├── [threadId]/
│   │   ├── route.ts
│   │   └── messages/route.ts
└── unified/route.ts
```

### Backend Current State
- Missing route files referenced in `/backend/routes/index.ts`
- Has PocketBase integration in various services
- Express server configured but routes not implemented

## Migration Tasks

### Phase 1: Backend Route Structure Creation

#### Task 1.1: Create Missing Route Files
- [ ] Create `/backend/routes/ai.ts`
- [ ] Create `/backend/routes/email.ts` 
- [ ] Create `/backend/routes/journal.ts`
- [ ] Create `/backend/routes/learningGuide.ts`
- [ ] Create `/backend/routes/marketplace.ts`
- [ ] Create `/backend/routes/media.ts`
- [ ] Create `/backend/routes/schoolHub.ts`
- [ ] Create `/backend/routes/threads.ts`
- [ ] Create `/backend/routes/unified.ts`
- [ ] Create `/backend/routes/classes.ts`
- [ ] Create `/backend/routes/search.ts`
- [ ] Create `/backend/routes/moodFocus.ts`

#### Task 1.2: Create Nested Route Handlers
For each complex route (like gamification), create a modular structure:

**Gamification Routes:**
- [ ] `/backend/routes/gamification/achievements.ts`
- [ ] `/backend/routes/gamification/goals.ts`
- [ ] `/backend/routes/gamification/milestones.ts`
- [ ] `/backend/routes/gamification/tokens.ts`
- [ ] `/backend/routes/gamification/index.ts` (aggregator)

**Learning Guide Routes:**
- [ ] `/backend/routes/learning-guide/analytics.ts`
- [ ] `/backend/routes/learning-guide/assessment.ts`
- [ ] `/backend/routes/learning-guide/pathways.ts`
- [ ] `/backend/routes/learning-guide/index.ts`

### Phase 2: Logic Migration

#### Task 2.1: Move Authentication Logic
- [ ] Copy auth logic from `/api/auth/route.ts` to `/backend/routes/auth.ts`
- [ ] Remove Next.js specific imports (NextResponse, next/server)
- [ ] Replace with Express req/res pattern
- [ ] Update cookie handling for Express

#### Task 2.2: Move Calendar Logic
- [ ] Migrate calendar event CRUD operations
- [ ] Implement recurrence pattern endpoints
- [ ] Handle series management

#### Task 2.3: Move Gamification Logic
- [ ] Achievement system endpoints
- [ ] Goal management and progress tracking
- [ ] Token economy system
- [ ] Milestone completion logic

#### Task 2.4: Move Learning Guide Logic
- [ ] Learning objectives management
- [ ] Pathway generation and adaptation
- [ ] Progress tracking
- [ ] Analytics endpoints

### Phase 3: Frontend Updates

#### Task 3.1: Update API Calls
- [ ] Create `/lib/api-client.ts` for centralized API calls
- [ ] Update all `fetch('/api/...)` calls to use the new client
- [ ] Remove direct PocketBase usage from frontend
- [ ] Update error handling for Express responses

#### Task 3.2: Update Hooks
- [ ] Update `useAuth` hook
- [ ] Update `useCalendar` hook
- [ ] Update `useGamification` hook
- [ ] Update `useLearningGuide` hook
- [ ] Update all other custom hooks

#### Task 3.3: Environment Configuration
- [ ] Update `.env` files for proper API URLs
- [ ] Configure Vite proxy settings
- [ ] Set up development vs production API endpoints

### Phase 4: Cleanup

#### Task 4.1: Remove Next.js Dependencies
- [ ] Remove all `/api` folder from frontend
- [ ] Remove Next.js related packages from package.json
- [ ] Clean up any Next.js specific configurations

#### Task 4.2: Update Documentation
- [ ] Update README with new architecture
- [ ] Document API endpoints
- [ ] Create development setup guide

### Phase 5: Testing & Validation

#### Task 5.1: API Testing
- [ ] Test all authentication endpoints
- [ ] Test calendar functionality
- [ ] Test gamification features
- [ ] Test learning guide features
- [ ] Test messaging system
- [ ] Test file uploads

#### Task 5.2: Integration Testing
- [ ] Test frontend-backend communication
- [ ] Verify CORS configuration
- [ ] Test real-time features (if any)
- [ ] Performance testing

## Implementation Order

1. **Week 1**: Backend structure and basic routes (Auth, Calendar, Users)
2. **Week 2**: Complex routes (Gamification, Learning Guide)
3. **Week 3**: Frontend updates and API client
4. **Week 4**: Testing, cleanup, and documentation

## Success Criteria

- [ ] All API routes working through Express backend
- [ ] Frontend completely separated from backend
- [ ] No Next.js dependencies in the project
- [ ] All features functioning as before
- [ ] Improved performance and maintainability
- [ ] Clear documentation for future development

## Notes

- Preserve all existing functionality
- Maintain backward compatibility where possible
- Focus on clean, maintainable code structure
- Ensure proper error handling throughout
- Implement proper logging for debugging

