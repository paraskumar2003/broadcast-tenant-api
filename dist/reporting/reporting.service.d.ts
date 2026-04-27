import { Model } from 'mongoose';
import { MessageDocument } from '../messaging/schemas/message.schema';
import { BroadcastDocument } from '../messaging/schemas/broadcast.schema';
import { TagDocument } from '../tagging/schemas/tag.schema';
export interface BroadcastReportFilters {
    projectConfigId: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    templateName?: string;
    tagIds?: string[];
    search?: string;
    page?: number;
    limit?: number;
}
export interface MessageReportFilters {
    projectConfigId: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    broadcastId?: string;
    templateName?: string;
    recipientNumber?: string;
    search?: string;
    page?: number;
    limit?: number;
}
export declare class ReportingService {
    private readonly messageModel;
    private readonly broadcastModel;
    private readonly tagModel;
    private readonly logger;
    constructor(messageModel: Model<MessageDocument>, broadcastModel: Model<BroadcastDocument>, tagModel: Model<TagDocument>);
    private buildDateRange;
    private buildBroadcastMatch;
    getBroadcastSummary(filters: BroadcastReportFilters): Promise<{
        totalBroadcasts: any;
        totalRecipients: any;
        totalSent: any;
        totalDelivered: any;
        totalFailed: any;
        totalRead: any;
        deliveryRate: number;
        readRate: number;
    }>;
    getBroadcastList(filters: BroadcastReportFilters): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
        };
    }>;
    getBroadcastExportCursor(filters: BroadcastReportFilters): import("mongoose").Cursor<any, never, any>;
    getDistinctTemplates(projectConfigId: string): Promise<string[]>;
    getMessageList(filters: MessageReportFilters): Promise<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
        };
    }>;
    getMessageExportCursor(filters: MessageReportFilters): import("mongoose").Cursor<any, never, any>;
}
