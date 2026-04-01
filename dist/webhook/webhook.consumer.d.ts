import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { DeliveryStatusDocument } from './schemas/delivery-status.schema';
import { MessageDocument } from '../messaging/schemas/message.schema';
import { MessageSessionDocument } from '../messaging/schemas/message-session.schema';
import type { IQueueConsumer } from '../queue/consumers/consumer.interface';
export declare class WebhookConsumer implements OnModuleInit {
    private deliveryStatusModel;
    private messageModel;
    private sessionModel;
    private readonly consumer;
    private readonly logger;
    constructor(deliveryStatusModel: Model<DeliveryStatusDocument>, messageModel: Model<MessageDocument>, sessionModel: Model<MessageSessionDocument>, consumer: IQueueConsumer);
    onModuleInit(): Promise<void>;
    processWebhook(data: any): Promise<void>;
    private processStatus;
}
