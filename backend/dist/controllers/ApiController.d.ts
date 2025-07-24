import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare class ApiController {
    fetchData: (req: AuthRequest, res: Response) => Promise<void>;
    syncData: (req: AuthRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=ApiController.d.ts.map