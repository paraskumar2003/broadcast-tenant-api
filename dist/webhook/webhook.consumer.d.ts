import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { DeliveryStatusDocument } from './schemas/delivery-status.schema';
import { MessageDocument } from '../messaging/schemas/message.schema';
import { MessageSessionDocument } from '../messaging/schemas/message-session.schema';
import { ContactDocument } from '../contact/schemas/contact.schema';
import { ConversationService } from '../conversation/conversation.service';
import { ProjectService } from '../project/project.service';
import type { IQueueConsumer } from '../queue/consumers/consumer.interface';
import { Broadcast } from 'src/messaging/schemas/broadcast.schema';
export declare class WebhookConsumer implements OnModuleInit {
    private deliveryStatusModel;
    private messageModel;
    private sessionModel;
    private contactModel;
    private broadcastModel;
    private readonly consumer;
    private readonly conversationService;
    private readonly projectService;
    private readonly logger;
    constructor(deliveryStatusModel: Model<DeliveryStatusDocument>, messageModel: Model<MessageDocument>, sessionModel: Model<MessageSessionDocument>, contactModel: Model<ContactDocument>, broadcastModel: Model<Broadcast>, consumer: IQueueConsumer, conversationService: ConversationService, projectService: ProjectService);
    onModuleInit(): Promise<void>;
    processWebhook(data: any): Promise<void>;
    private processInboundMessage;
    private processStatus;
    private normalizePhone;
    private mapMessageType;
}
