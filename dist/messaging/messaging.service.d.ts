import { Model, Types } from 'mongoose';
import { MessageSessionDocument } from './schemas/message-session.schema';
import { BroadcastDocument } from './schemas/broadcast.schema';
import { MessageDocument } from './schemas/message.schema';
import { ContactDocument } from '../contact/schemas/contact.schema';
import { ContactTaggingDocument } from '../tagging/schemas/contact-tagging.schema';
import { TagDocument } from '../tagging/schemas/tag.schema';
import { ProjectService } from '../project/project.service';
import type { IQueueService } from '../queue/queue.interface';
import { SendSingleDto, SendBulkDto, SendTextDto } from './dto/send-message.dto';
export interface MessageJobPayload {
    messageId: string;
    sessionId: string;
    broadcastId: string;
    projectConfigId: string;
    recipientNumber: string;
    templateName: string;
    templateComponents: any[];
    params: Record<string, any>;
    language: string;
    type: 'template' | 'text' | 'image' | 'video' | 'audio' | 'document';
    text?: string;
    mediaUrl?: string;
    fileName?: string;
}
export declare class MessagingService {
    private sessionModel;
    private broadcastModel;
    private messageModel;
    private contactModel;
    private contactTaggingModel;
    private tagModel;
    private readonly queueService;
    private readonly projectService;
    private readonly logger;
    constructor(sessionModel: Model<MessageSessionDocument>, broadcastModel: Model<BroadcastDocument>, messageModel: Model<MessageDocument>, contactModel: Model<ContactDocument>, contactTaggingModel: Model<ContactTaggingDocument>, tagModel: Model<TagDocument>, queueService: IQueueService, projectService: ProjectService);
    private generateBroadcastName;
    sendSingle(dto: SendSingleDto): Promise<{
        messageId: Types.ObjectId;
        sessionId?: Types.ObjectId | undefined;
        broadcastId?: Types.ObjectId | undefined;
    }>;
    sendBulk(dto: SendBulkDto): Promise<{
        sessionId: Types.ObjectId;
        totalQueued: number;
        broadcastId?: Types.ObjectId | undefined;
    }>;
    sendText(dto: SendTextDto): Promise<{
        status: boolean;
        message: string;
    }>;
    sendBulkCsv(opts: {
        fileBuffer: Buffer;
        projectConfigId: string;
        template: Record<string, any>;
        language?: string;
        scheduledAt?: string;
        skipBroadcast?: boolean;
        broadcastName?: string;
        variableMapping?: Record<string, string>;
    }): Promise<{
        sessionId: Types.ObjectId;
        totalQueued: number;
        contactsSynced: number;
        broadcastId?: Types.ObjectId | undefined;
    }>;
    listBroadcasts(projectConfigId: string, page: number, limit: number): Promise<{
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
    }>;
}
