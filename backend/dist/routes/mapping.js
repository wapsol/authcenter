"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MappingController_1 = require("../controllers/MappingController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const mappingController = new MappingController_1.MappingController();
// Get all internal apps (public endpoint)
router.get('/internal-apps', (0, errorHandler_1.asyncHandler)(mappingController.getInternalApps));
// Get all app mappings
router.get('/mappings', (0, errorHandler_1.asyncHandler)(mappingController.getMappings));
// Create new app mapping
router.post('/mappings', (0, errorHandler_1.asyncHandler)(mappingController.createMapping));
// Delete app mapping
router.delete('/mappings/:id', (0, errorHandler_1.asyncHandler)(mappingController.deleteMapping));
exports.default = router;
//# sourceMappingURL=mapping.js.map