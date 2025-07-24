"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ConnectionController_1 = require("../controllers/ConnectionController");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const connectionController = new ConnectionController_1.ConnectionController();
router.use(auth_1.authenticateToken);
router.get('/', (0, errorHandler_1.asyncHandler)(connectionController.getUserConnections));
router.get('/:id', (0, errorHandler_1.asyncHandler)(connectionController.getConnection));
router.delete('/:id', (0, errorHandler_1.asyncHandler)(connectionController.deleteConnection));
router.post('/:id/refresh', (0, errorHandler_1.asyncHandler)(connectionController.refreshConnection));
exports.default = router;
//# sourceMappingURL=connection.js.map