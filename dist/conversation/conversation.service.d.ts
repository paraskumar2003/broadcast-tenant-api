import { Model, Types } from 'mongoose';
import { Conversation, ConversationDocument } from './schemas/conversation.schema';
import { Message, MessageDocument } from '../messaging/schemas/message.schema';
import { ContactDocument } from '../contact/schemas/contact.schema';
import { ProjectService } from '../project/project.service';
import type { IQueueService } from '../queue/queue.interface';
export declare class ConversationService {
    private readonly conversationModel;
    private readonly messageModel;
    private readonly contactModel;
    private readonly projectService;
    private readonly queueService;
    private readonly logger;
    constructor(conversationModel: Model<ConversationDocument>, messageModel: Model<MessageDocument>, contactModel: Model<ContactDocument>, projectService: ProjectService, queueService: IQueueService);
    findOrCreateConversation(projectId: Types.ObjectId, contactId: Types.ObjectId, mobile: string): Promise<ConversationDocument>;
    updateLastMessage(conversationId: Types.ObjectId, messageId: Types.ObjectId, text: string, timestamp: Date, extendWindow?: boolean): Promise<void>;
    sendReply(conversationId: string, text: string): Promise<{
        messageId: Types.ObjectId;
        conversationId: Types.ObjectId;
    }>;
    closeExpiredConversations(): Promise<number>;
    listConversations(projectId: string, page?: number, limit?: number, status?: string): Promise<{
        data: (import("mongoose").Document<unknown, {}, ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & Conversation & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    }>;
    getConversation(id: string): Promise<import("mongoose").Document<unknown, {}, ConversationDocument, {}, import("mongoose").DefaultSchemaOptions> & Conversation & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMessages(conversationId: string, page?: number, limit?: number): Promise<{
        data: (import("mongoose").Document<unknown, {}, MessageDocument, {}, import("mongoose").DefaultSchemaOptions> & Message & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
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
    }>;
}
