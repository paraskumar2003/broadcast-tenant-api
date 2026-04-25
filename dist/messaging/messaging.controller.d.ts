import { MessagingService } from './messaging.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { SendSingleDto, SendBulkDto, SendTextDto } from './dto/send-message.dto';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    sendSingle(dto: SendSingleDto): Promise<ApiResponseDto<{
        messageId: import("mongoose").Types.ObjectId;
        sessionId?: import("mongoose").Types.ObjectId | undefined;
        broadcastId?: import("mongoose").Types.ObjectId | undefined;
    }>>;
    sendBulk(dto: SendBulkDto): Promise<ApiResponseDto<{
        sessionId: import("mongoose").Types.ObjectId;
        totalQueued: number;
        broadcastId?: import("mongoose").Types.ObjectId | undefined;
    }>>;
    sendBulkCsv(file: Express.Multer.File, projectConfigId: string, templateStr: string, language?: string, scheduledAt?: string, skipBroadcast?: string, broadcastName?: string): Promise<ApiResponseDto<{
        sessionId: import("mongoose").Types.ObjectId;
        totalQueued: number;
        contactsSynced: number;
        broadcastId?: import("mongoose").Types.ObjectId | undefined;
    }>>;
    sendText(dto: SendTextDto): Promise<ApiResponseDto<{
        status: boolean;
        message: string;
    }>>;
    listBroadcasts(projectConfigId: string, page?: string, limit?: string): Promise<ApiResponseDto<{
        data: {
            id: any;
            name: any;
            templateName: any;
            status: any;
            recipientsCount: any;
            counters: any;
            deliveredPercentage: number;
            scheduledAt: any;
            createdAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            hasNext: boolean;
        };
    }>>;
}
