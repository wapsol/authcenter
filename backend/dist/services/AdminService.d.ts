export interface AdminConfig {
    id: number;
    username: string;
    password_hash: string;
    created_at: Date;
}
export declare class AdminService {
    private get db();
    verifyPassword(password: string): Promise<boolean>;
    updatePassword(currentPassword: string, newPassword: string): Promise<void>;
    getAdminConfig(): Promise<AdminConfig | null>;
}
//# sourceMappingURL=AdminService.d.ts.map