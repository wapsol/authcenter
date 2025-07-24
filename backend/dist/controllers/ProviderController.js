"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderController = void 0;
const ProviderService_1 = require("../services/ProviderService");
const errorHandler_1 = require("../middleware/errorHandler");
const logger_1 = require("../utils/logger");
class ProviderController {
    constructor() {
        this.providerService = new ProviderService_1.ProviderService();
        this.getProviders = async (req, res) => {
            try {
                const providers = await this.providerService.getAllProviders();
                res.json({ providers });
            }
            catch (error) {
                logger_1.logger.error('Get providers error:', error);
                throw (0, errorHandler_1.createError)('Failed to fetch providers', 500);
            }
        };
        this.getProvider = async (req, res) => {
            try {
                const { id } = req.params;
                const provider = await this.providerService.getProviderById(parseInt(id));
                if (!provider) {
                    throw (0, errorHandler_1.createError)('Provider not found', 404);
                }
                res.json({ provider });
            }
            catch (error) {
                logger_1.logger.error('Get provider error:', error);
                throw error;
            }
        };
    }
}
exports.ProviderController = ProviderController;
//# sourceMappingURL=ProviderController.js.map