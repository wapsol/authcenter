import { Request, Response } from 'express';
export declare class AdminController {
    private adminService;
    private internalAppService;
    private auditService;
    verifyPassword: (req: Request, res: Response) => Promise<void>;
    getInternalApps: (req: Request, res: Response) => Promise<void>;
    createInternalApp: (req: Request, res: Response) => Promise<void>;
    getAuthLogs: (req: Request, res: Response) => Promise<void>;
    getLogStats: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=AdminController.d.ts.map