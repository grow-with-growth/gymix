import express, { Request, Response } from 'express';
import PocketBase from 'pocketbase';
import { authRateLimit } from '../../lib/rate-limit';
import { generateCsrfToken } from '../../lib/csrf';
import { getAuthCookieOptions } from '../../lib/secure-cookie';
import { jsonResponse, errorResponse, asyncHandler } from '../utils/routeMigrationHelper';

// Initialize PocketBase
const pb = new PocketBase(process.env.POCKETBASE_URL);

const router = express.Router();

router.post('/', asyncHandler(async (req: Request, res: Response) => {
    // Apply rate limiting for authentication requests
    const rateLimitResponse = authRateLimit(req);
    if (rateLimitResponse) {
        return jsonResponse(res, rateLimitResponse, 429);
    }

    const { action, email, password, name, role } = req.body;

    if (action === 'login') {
        if (!email || !password) {
            return errorResponse(res, 'Email and password are required', null, 400);
        }

        const authData = await pb.collection('users').authWithPassword(email, password);

        // Generate a new CSRF token
        const csrfToken = generateCsrfToken();

        // Set auth cookie with secure options
        res.cookie('pb_auth', pb.authStore.exportToCookie(), getAuthCookieOptions());

        return jsonResponse(res, { user: authData.record, csrfToken });
    }
    else if (action === 'register') {
        if (!email || !password || !name || !role) {
            return errorResponse(res, 'Email, password, name, and role are required', null, 400);
        }

        const data = {
            email,
            password,
            passwordConfirm: password,
            name,
            role,
            department: role // For simplicity, use role as department
        };

        const user = await pb.collection('users').create(data);

        // Generate a new CSRF token
        const csrfToken = generateCsrfToken();

        return jsonResponse(res, { user, csrfToken });
    }
    else if (action === 'logout') {
        pb.authStore.clear();
        res.clearCookie('pb_auth');
        res.clearCookie('csrf_token'); // Also clear the CSRF token
        return jsonResponse(res, { success: true });
    }
    else {
        return errorResponse(res, 'Invalid action', null, 400);
    }
}));

router.get('/', asyncHandler(async (req: Request, res: Response) => {
    // Get auth cookie
    const authCookie = req.cookies?.pb_auth;

    if (authCookie) {
        // Load the auth store from the cookie
        pb.authStore.loadFromCookie(`pb_auth=${authCookie}`);
    }

    // Check if user is authenticated
    const isAuthenticated = pb.authStore.isValid;
    const user = pb.authStore.model;

    // Generate a new CSRF token if authenticated
    const csrfToken = isAuthenticated ? generateCsrfToken() : null;

    return jsonResponse(res, {
        isAuthenticated,
        user,
        csrfToken
    });
}));

export default router;
