"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AdminController_1 = require("../controllers/AdminController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const adminController = new AdminController_1.AdminController();
// Admin authentication
router.post('/verify', (0, errorHandler_1.asyncHandler)(adminController.verifyPassword));
// Internal apps management
router.get('/apps', (0, errorHandler_1.asyncHandler)(adminController.getInternalApps));
router.post('/apps', (0, errorHandler_1.asyncHandler)(adminController.createInternalApp));
// Audit logs
router.get('/logs', (0, errorHandler_1.asyncHandler)(adminController.getAuthLogs));
router.get('/logs/stats', (0, errorHandler_1.asyncHandler)(adminController.getLogStats));
exports.default = router;
//# sourceMappingURL=admin.js.map