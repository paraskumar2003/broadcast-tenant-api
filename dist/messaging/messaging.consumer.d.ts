import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { MessageDocument } from './schemas/message.schema';
import { MessageSessionDocument } from './schemas/message-session.schema';
import { MetaApiService } from '../meta-api/meta-api.service';
import { ProjectService } from '../project/project.service';
import { TemplateBuilderService } from './template-builder.service';
import type { IQueueConsumer } from '../queue/consumers/consumer.interface';
import { MessageJobPayload } from './messaging.service';
export declare class MessagingConsumer implements OnModuleInit {
    private messageModel;
    private sessionModel;
    private readonly consumer;
    private readonly metaApiService;
    private readonly projectService;
    private readonly templateBuilder;
    private readonly logger;
    constructor(messageModel: Model<MessageDocument>, sessionModel: Model<MessageSessionDocument>, consumer: IQueueConsumer, metaApiService: MetaApiService, projectService: ProjectService, templateBuilder: TemplateBuilderService);
    onModuleInit(): Promise<void>;
    processMessage(data: MessageJobPayload): Promise<void>;
}
