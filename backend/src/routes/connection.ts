import { Router } from 'express';
import { ConnectionController } from '../controllers/ConnectionController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const connectionController = new ConnectionController();

router.use(authenticateToken);

router.get('/', asyncHandler(connectionController.getUserConnections));
router.get('/:id', asyncHandler(connectionController.getConnection));
router.delete('/:id', asyncHandler(connectionController.deleteConnection));
router.post('/:id/refresh', asyncHandler(connectionController.refreshConnection));

export default router;