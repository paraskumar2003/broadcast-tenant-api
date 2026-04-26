import { Injectable, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  DeliveryStatus,
  DeliveryStatusDocument,
} from './schemas/delivery-status.schema';
import { Message, MessageDocument } from '../messaging/schemas/message.schema';
import {
  MessageSession,
  MessageSessionDocument,
} from '../messaging/schemas/message-session.schema';
import { Contact, ContactDocument } from '../contact/schemas/contact.schema';
import { ConversationService } from '../conversation/conversation.service';
import { ProjectService } from '../project/project.service';
import type { IQueueConsumer } from '../queue/consumers/consumer.interface';
import { QUEUE_CONSUMER } from '../queue/consumers/consumer.interface';
import { QUEUE_NAMES } from '../queue/queue.interface';
import { Broadcast } from 'src/messaging/schemas/broadcast.schema';

@Injectable()
export class WebhookConsumer implements OnModuleInit {
  private readonly logger = new Logger(WebhookConsumer.name);

  constructor(
    @InjectModel(DeliveryStatus.name)
    private deliveryStatusModel: Model<DeliveryStatusDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(MessageSession.name)
    private sessionModel: Model<MessageSessionDocument>,
    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
    @InjectModel(Broadcast.name)
    private broadcastModel: Model<Broadcast>,
    @Inject(QUEUE_CONSUMER) private readonly consumer: IQueueConsumer,
    private readonly conversationService: ConversationService,
    private readonly projectService: ProjectService,
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

      // Process inbound messages
      const messages = value?.messages;
      if (messages && messages.length > 0) {
        for (const msg of messages) {
          await this.processInboundMessage(wabaId, msg, value.contacts);
        }
      }

      // Process status updates (sent, delivered, read, failed)
      const statuses = value?.statuses;
      if (statuses && statuses.length > 0) {
        for (const status of statuses) {
          await this.processStatus(wabaId, status, data);
        }
      }
    } catch (error: any) {
      this.logger.error(
        `Webhook processing error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ─── Inbound Message Processing ───────────────────────────────────────

  private async processInboundMessage(
    wabaId: string,
    msg: any,
    webhookContacts: any[],
  ): Promise<void> {
    const metaMessageId = msg.id;
    const senderNumber = msg.from;
    const timestamp = new Date(parseInt(msg.timestamp) * 1000);
    const messageType = msg.type || 'unknown';

    // Extract text body
    let text: string | null = null;
    if (messageType === 'text') {
      text = msg.text?.body || null;
    } else if (msg[messageType]?.caption) {
      text = msg[messageType].caption;
    }

    // Extract media URL (if any)
    const mediaUrl: string | null =
      msg[messageType]?.link || msg[messageType]?.url || null;

    try {
      // 1. Resolve project from WABA ID
      const config = await this.projectService.getConfigurationByWabaId(wabaId);
      if (!config) {
        this.logger.warn(`No project config found for WABA ID: ${wabaId}`);
        return;
      }
      const projectId = config.projectId;

      // 2. Normalize phone number
      const mobile = this.normalizePhone(senderNumber);

      // 3. Deduplication — check if message already exists
      const existingMessage = await this.messageModel.findOne({
        metaMessageId,
      });
      if (existingMessage) {
        this.logger.debug(
          `Duplicate inbound message skipped: ${metaMessageId}`,
        );
        return;
      }

      // 4. Find or create contact
      const contactName = webhookContacts?.[0]?.profile?.name || mobile;
      let contact = await this.contactModel.findOne({ projectId, mobile });
      if (!contact) {
        contact = await this.contactModel.create({
          projectId,
          mobile,
          name: contactName,
          isActive: true,
        });
        this.logger.debug(
          `Auto-created contact: ${mobile} in project ${projectId}`,
        );
      }

      const contactId = contact._id as Types.ObjectId;

      // 5. Find or create conversation
      const conversation =
        await this.conversationService.findOrCreateConversation(
          projectId,
          contactId,
          mobile,
        );

      // 6. Insert message
      const message = await this.messageModel.create({
        conversationId: conversation._id,
        contactId,
        projectConfigId: config._id,
        recipientNumber: mobile,
        metaMessageId,
        direction: 'inbound',
        messageType: this.mapMessageType(messageType),
        text,
        mediaUrl,
        currentStatus: 'received',
        statusHistory: [{ status: 'received', timestamp }],
      });

      // 7. Update conversation
      await this.conversationService.updateLastMessage(
        conversation._id as Types.ObjectId,
        message._id as Types.ObjectId,
        text || `[${messageType}]`,
        timestamp,
      );

      this.logger.debug(
        `Inbound ${messageType} from ${mobile} (msgId: ${metaMessageId})`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to process inbound message ${metaMessageId}: ${error.message}`,
        error.stack,
      );
    }
  }

  // ─── Status Update Processing ─────────────────────────────────────────

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

      // 4. Update broadcast counters
      if (message.broadcastId) {
        await this.broadcastModel.updateOne(
          { _id: message.broadcastId },
          {
            $inc: {
              'counters.delivered': statusValue === 'delivered' ? 1 : 0,
              'counters.read': statusValue === 'read' ? 1 : 0,
              'counters.failed': statusValue === 'failed' ? 1 : 0,
            },
          },
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

  // ─── Helpers ──────────────────────────────────────────────────────────

  private normalizePhone(phone: string): string {
    if (!phone.startsWith('+')) return `${phone}`;
    return phone;
  }

  private mapMessageType(waType: string): string {
    const mapping: Record<string, string> = {
      text: 'text',
      image: 'image',
      video: 'video',
      audio: 'audio',
      document: 'document',
      sticker: 'sticker',
      location: 'location',
      contacts: 'contacts',
      reaction: 'reaction',
    };
    return mapping[waType] || 'unknown';
  }
}
