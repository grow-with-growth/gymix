## Project Restructuring Plan

### Objective
To restructure the `gymix` project to clearly separate the frontend (Vite/React) and backend (Express) components, moving all API routes to the backend and removing confusion with Next.js.

### Analysis Summary
- **Current Issues**:
  - Mixed frontend configuration with Vite and Next.js API routes.
  - Backend routing inconsistencies with missing files.
  - Dependency issues where frontend accesses PocketBase directly.

### Plan

1. **Frontend (Vite/React)**
   - Remove all Next.js-style APIs from the `api` directory.
   - Update frontend components to use Express server endpoints.
   - Configure Vite to proxy requests to the Express backend.

2. **Backend (Express)**
   - Create backend route files to mirror the frontend `api` structure.
   - Implement real route handlers by moving logic from frontend API files.
   - Set up middleware:
     - Authentication & Authorization.
     - Input validation.
     - Error handling.
   - Use CORS configuration to allow frontend requests.

3. **Specific Tasks**
   - **Create Route Files**: Translate API structure to Express counterparts.
     - Example: `api/gamification` --> `backend/routes/gamification` with matching nested folders and route files.
   - **Migrate Logic**: Move logic from frontend route files to Express handlers.
   - **Update Imports**: Fix import paths for backend use.
   - **Configure Express**: Properly wire up routes and apply middleware.
   - **Adjust Vite Proxy**: Set up Vite proxy to forward `/api` to Express server.
   - **Remove Unnecessary Files**: Delete redundant Next.js API files from frontend.

4. **Testing & Verification**
   - Thoroughly test routes to ensure all API endpoints work as expected.
   - Validate CORS and other middleware configurations.

### Outcome
A well-separated project where the frontend uses Vite/React and the backend uses Express. All API logic centralized in the backend, allowing clean separation of concerns and easier maintenance.

