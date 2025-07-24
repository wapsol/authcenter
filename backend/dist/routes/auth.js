"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
router.get('/google', (0, errorHandler_1.asyncHandler)(authController.initiateGoogleAuth));
router.get('/google/callback', (0, errorHandler_1.asyncHandler)(authController.handleGoogleCallback));
router.post('/logout', (0, errorHandler_1.asyncHandler)(authController.logout));
router.get('/me', (0, errorHandler_1.asyncHandler)(authController.getCurrentUser));
exports.default = router;
//# sourceMappingURL=auth.js.map