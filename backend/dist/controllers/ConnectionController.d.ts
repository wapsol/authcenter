import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ConnectionController {
    private userService;
    private googleAuthService;
    getUserConnections: (req: AuthRequest, res: Response) => Promise<void>;
    getConnection: (req: AuthRequest, res: Response) => Promise<void>;
    deleteConnection: (req: AuthRequest, res: Response) => Promise<void>;
    refreshConnection: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=ConnectionController.d.ts.map