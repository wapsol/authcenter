export interface Provider {
    id: number;
    name: string;
    display_name: string;
    oauth_config: any;
    scopes: string[];
    enabled: boolean;
    created_at: Date;
}
export declare class ProviderService {
    private get db();
    getAllProviders(): Promise<Provider[]>;
    getProviderById(id: number): Promise<Provider | null>;
    getProviderByName(name: string): Promise<Provider | null>;
}
//# sourceMappingURL=ProviderService.d.ts.map