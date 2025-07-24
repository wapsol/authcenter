export interface GoogleTokens {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
    token_type: string;
}
export interface GoogleUserInfo {
    id: string;
    email: string;
    name: string;
    picture?: string;
}
export declare class GoogleAuthService {
    private oauth2Client;
    constructor();
    getAuthUrl(): string;
    exchangeCodeForTokens(code: string): Promise<GoogleTokens>;
    getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
    refreshToken(refreshToken: string): Promise<GoogleTokens>;
    revokeToken(accessToken: string): Promise<void>;
}
//# sourceMappingURL=GoogleAuthService.d.ts.map