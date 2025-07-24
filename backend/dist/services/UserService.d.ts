export interface User {
    id: number;
    email: string;
    name: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateUserData {
    email: string;
    name: string;
}
export interface Connection {
    id: number;
    user_id: number;
    provider_id: number;
    provider_name: string;
    external_id: string;
    status: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateConnectionData {
    provider: string;
    externalId: string;
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    scopes: string[];
}
export declare class UserService {
    private get db();
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    create(userData: CreateUserData): Promise<User>;
    createOrUpdateConnection(userId: number, connectionData: CreateConnectionData): Promise<void>;
    getUserConnections(userId: number): Promise<Connection[]>;
    getConnection(userId: number, connectionId: number): Promise<Connection | null>;
    deleteConnection(userId: number, connectionId: number): Promise<void>;
}
//# sourceMappingURL=UserService.d.ts.map