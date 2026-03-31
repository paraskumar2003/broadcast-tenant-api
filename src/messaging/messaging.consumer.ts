import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import {
  MessageSession,
  MessageSessionDocument,
} from './schemas/message-session.schema';
import { MetaApiService } from '../meta-api/meta-api.service';
import { ProjectService } from '../project/project.service';
import { TemplateBuilderService } from './template-builder.service';
import type { IQueueConsumer } from '../queue/consumers/consumer.interface';
import { QUEUE_CONSUMER } from '../queue/consumers/consumer.interface';
import { QUEUE_NAMES } from '../queue/queue.interface';
import { MessageJobPayload } from './messaging.service';

@Injectable()
export class MessagingConsumer implements OnModuleInit {
  private readonly logger = new Logger(MessagingConsumer.name);

  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MessageSession.name)
    private sessionModel: Model<MessageSessionDocument>,
    @Inject(QUEUE_CONSUMER) private readonly consumer: IQueueConsumer,
    private readonly metaApiService: MetaApiService,
    private readonly projectService: ProjectService,
    private readonly templateBuilder: TemplateBuilderService,
  ) {}

  async onModuleInit() {
    this.consumer.registerHandler(
      QUEUE_NAMES.MESSAGE_SEND,
      this.processMessage.bind(this),
      2, // concurrency
    );
    await this.consumer.start();
    this.logger.log('Messaging consumer registered');
  }

  async processMessage(data: MessageJobPayload): Promise<void> {
    const { messageId, sessionId, projectConfigId, recipientNumber, type } =
      data;

    console.log(data, 'data');

    try {
      const config =
        await this.projectService.getConfigurationById(projectConfigId);

      if (type === 'text') {
        // Send text message
        const response = await this.metaApiService.sendTextMessage(
          config.phoneNumberId,
          config.accessToken,
          recipientNumber,
          data.text || '',
        );
        const metaMessageId = response.messages?.[0]?.id;

        // Update message record
        if (messageId) {
          await this.messageModel.updateOne(
            { _id: new Types.ObjectId(messageId) },
            {
              metaMessageId,
              currentStatus: 'sent',
              $push: {
                statusHistory: { status: 'sent', timestamp: new Date() },
              },
            },
          );
        }

        // Update session counters
        if (sessionId) {
          await this.sessionModel.updateOne(
            { _id: new Types.ObjectId(sessionId) },
            { $inc: { 'counters.sent': 1 } },
          );
        }

        this.logger.log(
          `Text message sent to ${recipientNumber} (metaId: ${metaMessageId})`,
        );
        return;
      }

      // Build template components
      const components = this.templateBuilder.buildComponents(
        data.templateComponents,
        data.params,
      );

      // Send via Meta API
      const response = await this.metaApiService.sendTemplateMessage(
        config.phoneNumberId,
        config.accessToken,
        recipientNumber,
        data.templateName,
        data.language,
        components,
      );

      const metaMessageId = response.messages?.[0]?.id;

      // Update message record with Meta response
      if (messageId) {
        await this.messageModel.updateOne(
          { _id: new Types.ObjectId(messageId) },
          {
            metaMessageId,
            currentStatus: 'sent',
            $push: {
              statusHistory: { status: 'sent', timestamp: new Date() },
            },
          },
        );
      }

      // Update session counters
      if (sessionId) {
        const session = await this.sessionModel.findById(sessionId);
        if (session) {
          const newSentCount = session.counters.sent + 1;
          const isComplete = newSentCount >= session.totalRecipients;

          await this.sessionModel.updateOne(
            { _id: new Types.ObjectId(sessionId) },
            {
              $inc: { 'counters.sent': 1 },
              ...(isComplete
                ? { status: 'completed', completedAt: new Date() }
                : {}),
            },
          );
        }
      }

      this.logger.log(
        `Template message sent to ${recipientNumber} (metaId: ${metaMessageId})`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to send message to ${recipientNumber}: ${error.message}`,
      );

      // Update message as failed
      if (messageId) {
        await this.messageModel.updateOne(
          { _id: new Types.ObjectId(messageId) },
          {
            currentStatus: 'failed',
            errorDetails: { message: error.message, stack: error.stack },
            $push: {
              statusHistory: {
                status: 'failed',
                timestamp: new Date(),
                raw: { error: error.message },
              },
            },
          },
        );
      }

      // Update session failed counter
      if (sessionId) {
        await this.sessionModel.updateOne(
          { _id: new Types.ObjectId(sessionId) },
          { $inc: { 'counters.failed': 1 } },
        );
      }

      throw error; // Re-throw for queue retry logic
    }
  }
}
