import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class AuthController {
    private googleAuthService;
    private userService;
    initiateGoogleAuth: (req: Request, res: Response) => Promise<void>;
    handleGoogleCallback: (req: Request, res: Response) => Promise<void>;
    logout: (req: AuthRequest, res: Response) => Promise<void>;
    getCurrentUser: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map