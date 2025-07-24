"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ProviderController_1 = require("../controllers/ProviderController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const providerController = new ProviderController_1.ProviderController();
router.get('/', (0, errorHandler_1.asyncHandler)(providerController.getProviders));
router.get('/:id', (0, errorHandler_1.asyncHandler)(providerController.getProvider));
exports.default = router;
//# sourceMappingURL=provider.js.map