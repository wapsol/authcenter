"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ApiController_1 = require("../controllers/ApiController");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const apiController = new ApiController_1.ApiController();
router.use(auth_1.authenticateToken);
router.get('/data/:provider/:service', (0, errorHandler_1.asyncHandler)(apiController.fetchData));
router.post('/data/:provider/:service', (0, errorHandler_1.asyncHandler)(apiController.syncData));
exports.default = router;
//# sourceMappingURL=api.js.map