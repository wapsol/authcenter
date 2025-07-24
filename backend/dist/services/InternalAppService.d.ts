export interface InternalApp {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    logo_url?: string;
    api_endpoints?: string;
    manifest_data?: string;
    status: string;
    created_at: Date;
}
export interface CreateInternalAppData {
    name: string;
    display_name: string;
    description?: string;
    logo_url?: string;
    api_endpoints?: string;
    manifest_data?: string;
}
export interface AppMapping {
    id: number;
    external_provider_id: number;
    internal_app_id: number;
    connection_id: number;
    created_at: Date;
    external_provider_name?: string;
    internal_app_name?: string;
}
export declare class InternalAppService {
    private get db();
    getAllApps(): Promise<InternalApp[]>;
    getAppById(id: number): Promise<InternalApp | null>;
    getAppByName(name: string): Promise<InternalApp | null>;
    createApp(appData: CreateInternalAppData): Promise<InternalApp>;
    updateApp(id: number, appData: Partial<CreateInternalAppData>): Promise<InternalApp>;
    deleteApp(id: number): Promise<void>;
    createMapping(externalProviderId: number, internalAppId: number, connectionId: number): Promise<AppMapping>;
    getMappings(): Promise<AppMapping[]>;
    deleteMapping(id: number): Promise<void>;
}
//# sourceMappingURL=InternalAppService.d.ts.map