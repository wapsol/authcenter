import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const adminController = new AdminController();

// Admin authentication
router.post('/verify', asyncHandler(adminController.verifyPassword));

// Internal apps management
router.get('/apps', asyncHandler(adminController.getInternalApps));
router.post('/apps', asyncHandler(adminController.createInternalApp));

// Audit logs
router.get('/logs', asyncHandler(adminController.getAuthLogs));
router.get('/logs/stats', asyncHandler(adminController.getLogStats));

export default router;