import { Router } from 'express';
import authRoutes from './auth';
import calendarRoutes from './calendar';
import gamificationRoutes from './gamification';
import aiRoutes from './ai';
import emailRoutes from './email';
import journalRoutes from './journal';
import learningGuideRoutes from './learningGuide';
import marketplaceRoutes from './marketplace';
import mediaRoutes from './media';
import schoolHubRoutes from './schoolHub';
import threadsRoutes from './threads';
import unifiedRoutes from './unified';
import classesRoutes from './classes';
import searchRoutes from './search';
import moodFocusRoutes from './moodFocus';

const router = Router();

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/calendar', calendarRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/ai', aiRoutes);
router.use('/ai-mentor', aiRoutes); // Alias for AI routes
router.use('/email', emailRoutes);
router.use('/emails', emailRoutes); // Alias for email routes
router.use('/journal', journalRoutes);
router.use('/learning-guide', learningGuideRoutes);
router.use('/marketplace-products', marketplaceRoutes);
router.use('/media', mediaRoutes);
router.use('/school-hub-dashboard', schoolHubRoutes);
router.use('/school-users', schoolHubRoutes);
router.use('/threads', threadsRoutes);
router.use('/unified', unifiedRoutes);
router.use('/classes', classesRoutes);
router.use('/search', searchRoutes);
router.use('/mood-focus-checkin', moodFocusRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;

