import type { Response } from 'express';
import { ReportingService } from './reporting.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getMessages(body: {
        date?: string;
        number?: string;
        sessionId?: string;
        page?: number;
        limit?: number;
    }): Promise<ApiResponseDto<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>>;
    getSessionSummary(body: {
        date?: string;
        projectConfigId?: string;
        page?: number;
        limit?: number;
    }): Promise<ApiResponseDto<{
        data: (import("mongoose").Document<unknown, {}, import("../messaging/schemas/message-session.schema").MessageSessionDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../messaging/schemas/message-session.schema").MessageSession & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        total: number;
        page: number;
        limit: number;
    }>>;
    getAnalytics(body: {
        startDate: string;
        endDate: string;
        wabaId?: string;
        templateName?: string;
    }): Promise<ApiResponseDto<any[]>>;
    exportExcel(body: {
        date: string;
        wabaId?: string;
        templateName?: string;
        status?: string;
    }, res: Response): Promise<void>;
}
