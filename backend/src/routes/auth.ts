import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const authController = new AuthController();

router.get('/google', asyncHandler(authController.initiateGoogleAuth));
router.get('/google/callback', asyncHandler(authController.handleGoogleCallback));
router.post('/logout', asyncHandler(authController.logout));
router.get('/me', asyncHandler(authController.getCurrentUser));

export default router;