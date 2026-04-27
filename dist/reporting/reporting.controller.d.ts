import type { Response } from 'express';
import { ReportingService } from './reporting.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
export declare class ReportingController {
    private readonly reportingService;
    constructor(reportingService: ReportingService);
    getBroadcastSummary(projectConfigId: string, startDate?: string, endDate?: string, status?: string, templateName?: string, tagIdsStr?: string): Promise<ApiResponseDto<{
        totalBroadcasts: any;
        totalRecipients: any;
        totalSent: any;
        totalDelivered: any;
        totalFailed: any;
        totalRead: any;
        deliveryRate: number;
        readRate: number;
    }>>;
    getBroadcastList(projectConfigId: string, startDate?: string, endDate?: string, status?: string, templateName?: string, tagIdsStr?: string, search?: string, page?: string, limit?: string): Promise<ApiResponseDto<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
        };
    }>>;
    exportBroadcasts(projectConfigId: string, startDate?: string, endDate?: string, status?: string, templateName?: string, tagIdsStr?: string, res?: Response): Promise<void>;
    getDistinctTemplates(projectConfigId: string): Promise<ApiResponseDto<string[]>>;
    getMessageList(projectConfigId: string, startDate?: string, endDate?: string, status?: string, broadcastId?: string, templateName?: string, recipientNumber?: string, search?: string, page?: string, limit?: string): Promise<ApiResponseDto<{
        data: any[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
        };
    }>>;
    exportMessages(projectConfigId: string, startDate?: string, endDate?: string, status?: string, broadcastId?: string, templateName?: string, recipientNumber?: string, res?: Response): Promise<void>;
}
