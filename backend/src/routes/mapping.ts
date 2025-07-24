import { Router } from 'express';
import { MappingController } from '../controllers/MappingController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const mappingController = new MappingController();

// Get all internal apps (public endpoint)
router.get('/internal-apps', asyncHandler(mappingController.getInternalApps));

// Get all app mappings
router.get('/mappings', asyncHandler(mappingController.getMappings));

// Create new app mapping
router.post('/mappings', asyncHandler(mappingController.createMapping));

// Delete app mapping
router.delete('/mappings/:id', asyncHandler(mappingController.deleteMapping));

export default router;