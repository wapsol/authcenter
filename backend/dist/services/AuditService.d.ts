export interface AuthEvent {
    id?: number;
    event_type: string;
    external_app?: string;
    internal_app?: string;
    user_identifier?: string;
    ip_address?: string;
    user_agent?: string;
    success: boolean;
    error_message?: string;
    details?: string;
    created_at?: Date;
}
export interface LogFilter {
    limit?: number;
    offset?: number;
    event_type?: string;
    success?: boolean;
    start_date?: string;
    end_date?: string;
}
export interface LogStats {
    total_events: number;
    success_count: number;
    failure_count: number;
    recent_events: number;
    event_types: {
        [key: string]: number;
    };
}
export declare class AuditService {
    private get db();
    logEvent(event: Omit<AuthEvent, 'id' | 'created_at'>): Promise<void>;
    getLogs(filter?: LogFilter): Promise<AuthEvent[]>;
    getLogStats(): Promise<LogStats>;
    getRecentEvents(limit?: number): Promise<AuthEvent[]>;
    clearOldLogs(daysToKeep?: number): Promise<number>;
}
//# sourceMappingURL=AuditService.d.ts.map