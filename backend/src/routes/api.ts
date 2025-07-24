import { Router } from 'express';
import { ApiController } from '../controllers/ApiController';
import { asyncHandler } from '../middleware/errorHandler';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const apiController = new ApiController();

router.use(authenticateToken);

router.get('/data/:provider/:service', asyncHandler(apiController.fetchData));
router.post('/data/:provider/:service', asyncHandler(apiController.syncData));

export default router;