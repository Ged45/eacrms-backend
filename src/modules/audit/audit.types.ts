export interface AuditLogDTO {

    userId?: string;

    action: string;

    entity: string;

    entityId?: string;

    details?: Record<string, unknown>;

    ipAddress?: string;

    userAgent?: string;

}