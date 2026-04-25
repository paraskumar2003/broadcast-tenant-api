export declare class SendSingleDto {
    projectConfigId: string;
    number: string;
    template: Record<string, any>;
    params?: Record<string, any>;
    language?: string;
    scheduledAt?: string;
    skipBroadcast?: boolean;
    broadcastName?: string;
}
export declare class SendBulkDto {
    projectConfigId: string;
    template: Record<string, any>;
    recipients?: Array<{
        number: string;
        params?: Record<string, any>;
    }>;
    tagIds?: string[];
    params?: Record<string, any>;
    language?: string;
    scheduledAt?: string;
    skipBroadcast?: boolean;
    broadcastName?: string;
}
export declare class SendTextDto {
    projectConfigId: string;
    number: string;
    text: string;
}
