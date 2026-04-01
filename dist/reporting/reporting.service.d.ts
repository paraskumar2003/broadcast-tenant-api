import { Model } from 'mongoose';
import { MessageDocument } from '../messaging/schemas/message.schema';
import { MessageSession, MessageSessionDocument } from '../messaging/schemas/message-session.schema';
import { DeliveryStatusDocument } from '../webhook/schemas/delivery-status.schema';
export declare class ReportingService {
    private readonly messageModel;
    private readonly sessionModel;
    private readonly deliveryStatusModel;
    private readonly logger;
    constructor(messageModel: Model<MessageDocument>, sessionModel: Model<MessageSessionDocument>, deliveryStatusModel: Model<DeliveryStatusDocument>);
    getMessages(filters: {
        date?: string;
        number?: string;
        sessionId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getSessionSummary(filters: {
        date?: string;
        projectConfigId?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: (import("mongoose").Document<unknown, {}, MessageSessionDocument, {}, import("mongoose").DefaultSchemaOptions> & MessageSession & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAnalytics(filters: {
        startDate: string;
        endDate: string;
        wabaId?: string;
        templateName?: string;
    }): Promise<any[]>;
    getExcelCursor(filters: {
        date: string;
        wabaId?: string;
        templateName?: string;
        status?: string;
    }): import("mongoose").Cursor<any, never, any>;
}
