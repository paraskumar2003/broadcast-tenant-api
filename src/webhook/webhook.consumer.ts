import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DeliveryStatus, DeliveryStatusDocument } from './schemas/delivery-status.schema';
import { Message, MessageDocument } from '../messaging/schemas/message.schema';
import {
  MessageSession,
  MessageSessionDocument,
} from '../messaging/schemas/message-session.schema';
import type { IQueueConsumer } from '../queue/consumers/consumer.interface';
import { QUEUE_CONSUMER } from '../queue/consumers/consumer.interface';
import { QUEUE_NAMES } from '../queue/queue.interface';

@Injectable()
export class WebhookConsumer implements OnModuleInit {
  private readonly logger = new Logger(WebhookConsumer.name);

  constructor(
    @InjectModel(DeliveryStatus.name)
    private deliveryStatusModel: Model<DeliveryStatusDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MessageSession.name)
    private sessionModel: Model<MessageSessionDocument>,
    @Inject(QUEUE_CONSUMER) private readonly consumer: IQueueConsumer,
  ) {}

  async onModuleInit() {
    this.consumer.registerHandler(
      QUEUE_NAMES.WEBHOOK_PROCESS,
      this.processWebhook.bind(this),
      5, // concurrency
    );
  }

  async processWebhook(data: any): Promise<void> {
    try {
      if (
        data.object !== 'whatsapp_business_account' ||
        !data.entry?.[0]?.changes?.length
      ) {
        return;
      }

      const entry = data.entry[0];
      const wabaId = entry.id;
      const change = entry.changes[0];

      if (change.field !== 'messages') return;

      const value = change.value;
      const statuses = value?.statuses;

      // Process status updates (sent, delivered, read, failed)
      if (statuses && statuses.length > 0) {
        for (const status of statuses) {
          await this.processStatus(wabaId, status, data);
        }
      }
    } catch (error: any) {
      this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processStatus(
    wabaId: string,
    status: any,
    rawPayload: any,
  ): Promise<void> {
    const metaMessageId = status.id;
    const recipientNumber = status.recipient_id;
    const statusValue = status.status; // sent, delivered, read, failed
    const timestamp = new Date(parseInt(status.timestamp) * 1000);

    // Extract error details if present
    const errorCode = status.errors?.[0]?.code || null;
    const errorTitle = status.errors?.[0]?.title || null;

    // 1. Save raw delivery status
    await this.deliveryStatusModel.create({
      wabaId,
      metaMessageId,
      recipientNumber,
      status: statusValue,
      errorCode,
      errorTitle,
      timestamp,
      rawPayload,
    });

    // 2. Update the message record
    const message = await this.messageModel.findOne({ metaMessageId });

    if (message) {
      // Only update currentStatus if it's a "forward" status transition
      const statusOrder = ['queued', 'sent', 'delivered', 'read', 'failed'];
      const currentIdx = statusOrder.indexOf(message.currentStatus);
      const newIdx = statusOrder.indexOf(statusValue);

      const shouldUpdateCurrent =
        statusValue === 'failed' || newIdx > currentIdx;

      await this.messageModel.updateOne(
        { _id: message._id },
        {
          ...(shouldUpdateCurrent ? { currentStatus: statusValue } : {}),
          ...(statusValue === 'failed'
            ? { errorDetails: { code: errorCode, title: errorTitle } }
            : {}),
          $push: {
            statusHistory: {
              status: statusValue,
              timestamp,
              raw: { errorCode, errorTitle },
            },
          },
        },
      );

      // 3. Update session counters
      if (message.sessionId) {
        const counterField = `counters.${statusValue}`;
        await this.sessionModel.updateOne(
          { _id: message.sessionId },
          { $inc: { [counterField]: 1 } },
        );
      }

      this.logger.debug(
        `Status update: ${recipientNumber} -> ${statusValue} (msgId: ${metaMessageId})`,
      );
    } else {
      this.logger.debug(
        `Status update for unknown message: ${metaMessageId} -> ${statusValue}`,
      );
    }
  }
}
