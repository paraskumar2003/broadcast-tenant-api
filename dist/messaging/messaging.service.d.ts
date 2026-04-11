import { Model, Types } from 'mongoose';
import { MessageSessionDocument } from './schemas/message-session.schema';
import { MessageDocument } from './schemas/message.schema';
import { ProjectService } from '../project/project.service';
import type { IQueueService } from '../queue/queue.interface';
import { SendSingleDto, SendBulkDto, SendTextDto } from './dto/send-message.dto';
export interface MessageJobPayload {
    messageId: string;
    sessionId: string;
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
    private messageModel;
    private readonly queueService;
    private readonly projectService;
    private readonly logger;
    constructor(sessionModel: Model<MessageSessionDocument>, messageModel: Model<MessageDocument>, queueService: IQueueService, projectService: ProjectService);
    sendSingle(dto: SendSingleDto): Promise<{
        sessionId: Types.ObjectId;
        messageId: Types.ObjectId;
    }>;
    sendBulk(dto: SendBulkDto): Promise<{
        sessionId: Types.ObjectId;
        totalQueued: number;
    }>;
    sendText(dto: SendTextDto): Promise<{
        status: boolean;
        message: string;
    }>;
}
