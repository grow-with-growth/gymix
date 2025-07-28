import { Router, Request, Response } from 'express';
import PocketBase from 'pocketbase';
import { authRateLimit } from '../utils/rate-limit';
import { generateCsrfToken } from '../utils/csrf';
import { getAuthCookieOptions } from '../utils/secure-cookie';

const router = Router();
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090');

// Login/Register/Logout
router.post('/', async (req: Request, res: Response) => {
    try {
        // Apply rate limiting for authentication requests
        const rateLimitResponse = authRateLimit(req);
        if (rateLimitResponse) {
            return res.status(429).json({ error: 'Too many requests' });
        }
        
        const { action, email, password, name, role } = req.body;
        
        if (action === 'login') {
            if (!email || !password) {
                return res.status(400).json({ error: 'Email and password are required' });
            }
            
            const authData = await pb.collection('users').authWithPassword(email, password);
            
            // Generate a new CSRF token
            const csrfToken = generateCsrfToken();
            
            // Set auth cookie with secure options
            res.cookie('pb_auth', pb.authStore.exportToCookie(), getAuthCookieOptions());
            
            return res.json({ 
                user: authData.record,
                csrfToken // Return the CSRF token to the client
            });
        } 
        else if (action === 'register') {
            if (!email || !password || !name || !role) {
                return res.status(400).json({ error: 'Email, password, name, and role are required' });
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
            
            return res.json({ 
                user,
                csrfToken // Return the CSRF token to the client
            });
        } 
        else if (action === 'logout') {
            pb.authStore.clear();
            res.clearCookie('pb_auth');
            res.clearCookie('csrf_token'); // Also clear the CSRF token
            return res.json({ success: true });
        } 
        else {
            return res.status(400).json({ error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return res.status(500).json({ error: 'Authentication failed', details: message });
    }
});

// Check auth status
router.get('/', async (req: Request, res: Response) => {
    try {
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
        
        return res.json({ 
            isAuthenticated, 
            user,
            csrfToken // Return the CSRF token to the client
        });
    } catch (error) {
        console.error('Authentication check error:', error);
        return res.json({ isAuthenticated: false, user: null });
    }
});

export default router;

