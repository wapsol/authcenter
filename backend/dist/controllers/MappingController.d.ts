import { Request, Response } from 'express';
export declare class MappingController {
    private internalAppService;
    private auditService;
    getInternalApps: (req: Request, res: Response) => Promise<void>;
    getMappings: (req: Request, res: Response) => Promise<void>;
    createMapping: (req: Request, res: Response) => Promise<void>;
    deleteMapping: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=MappingController.d.ts.map