import { ConversationService } from './conversation.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
declare class ReplyDto {
    text: string;
}
export declare class ConversationController {
    private readonly conversationService;
    constructor(conversationService: ConversationService);
    listConversations(projectId: string, status?: string, page?: string, limit?: string): Promise<ApiResponseDto<{
        data: (import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>>;
    reply(id: string, dto: ReplyDto): Promise<ApiResponseDto<{
        messageId: import("mongoose").Types.ObjectId;
        conversationId: import("mongoose").Types.ObjectId;
    }>>;
    getMessages(id: string, page?: string, limit?: string): Promise<ApiResponseDto<{
        data: (import("mongoose").Document<unknown, {}, import("../messaging/schemas/message.schema").MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & import("../messaging/schemas/message.schema").Message & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>>;
    getConversation(id: string): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/conversation.schema").ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/conversation.schema").Conversation & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
}
export {};
