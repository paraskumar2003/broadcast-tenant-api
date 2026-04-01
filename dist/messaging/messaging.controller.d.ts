import { MessagingService } from './messaging.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { SendSingleDto, SendBulkDto, SendTextDto } from './dto/send-message.dto';
export declare class MessagingController {
    private readonly messagingService;
    constructor(messagingService: MessagingService);
    sendSingle(dto: SendSingleDto): Promise<ApiResponseDto<{
        sessionId: import("mongoose").Types.ObjectId;
        messageId: import("mongoose").Types.ObjectId;
    }>>;
    sendBulk(dto: SendBulkDto): Promise<ApiResponseDto<{
        sessionId: import("mongoose").Types.ObjectId;
        totalQueued: number;
    }>>;
    sendText(dto: SendTextDto): Promise<ApiResponseDto<{
        status: boolean;
        message: string;
    }>>;
}
