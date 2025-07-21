import { Router } from 'express';
import { ProviderController } from '../controllers/ProviderController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const providerController = new ProviderController();

router.get('/', asyncHandler(providerController.getProviders));
router.get('/:id', asyncHandler(providerController.getProvider));

export default router;