import { Injectable, Logger, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MessageSession,
  MessageSessionDocument,
} from './schemas/message-session.schema';
import { Message, MessageDocument } from './schemas/message.schema';
import { ProjectService } from '../project/project.service';
import type { IQueueService } from '../queue/queue.interface';
import { QUEUE_SERVICE, QUEUE_NAMES } from '../queue/queue.interface';
import {
  SendSingleDto,
  SendBulkDto,
  SendTextDto,
} from './dto/send-message.dto';

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

@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(
    @InjectModel(MessageSession.name)
    private sessionModel: Model<MessageSessionDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @Inject(QUEUE_SERVICE) private readonly queueService: IQueueService,
    private readonly projectService: ProjectService,
  ) {}

  /**
   * Send a template message to a single recipient.
   */
  async sendSingle(dto: SendSingleDto) {
    const session = await this.sessionModel.create({
      projectConfigId: new Types.ObjectId(dto.projectConfigId),
      templateName: dto.template.name,
      templatePayload: dto.template,
      language: dto.language || 'en_US',
      totalRecipients: 1,
      status: 'processing',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    const message = await this.messageModel.create({
      sessionId: session._id,
      projectConfigId: new Types.ObjectId(dto.projectConfigId),
      recipientNumber: dto.number,
      templateName: dto.template.name,
      language: dto.language || 'en_US',
      currentStatus: 'queued',
      statusHistory: [{ status: 'queued', timestamp: new Date() }],
    });

    await this.sessionModel.updateOne(
      { _id: session._id },
      { $inc: { 'counters.queued': 1 } },
    );

    const payload: MessageJobPayload = {
      messageId: message._id.toString(),
      sessionId: session._id.toString(),
      projectConfigId: dto.projectConfigId,
      recipientNumber: dto.number,
      templateName: dto.template.name,
      templateComponents: dto.template.components || [],
      params: dto.params || {},
      language: dto.language || 'en_US',
      type: 'template',
    };

    const delayMs = dto.scheduledAt
      ? new Date(dto.scheduledAt).getTime() - Date.now()
      : undefined;

    await this.queueService.publish(QUEUE_NAMES.MESSAGE_SEND, payload, {
      delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
    });

    return { sessionId: session._id, messageId: message._id };
  }

  /**
   * Send a template message to multiple recipients.
   */
  async sendBulk(dto: SendBulkDto) {
    const session = await this.sessionModel.create({
      projectConfigId: new Types.ObjectId(dto.projectConfigId),
      templateName: dto.template.name,
      templatePayload: dto.template,
      language: dto.language || 'en_US',
      totalRecipients: dto.recipients.length,
      status: 'processing',
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
    });

    const delayMs = dto.scheduledAt
      ? new Date(dto.scheduledAt).getTime() - Date.now()
      : undefined;

    const messages = await this.messageModel.insertMany(
      dto.recipients.map((r) => ({
        sessionId: session._id,
        projectConfigId: new Types.ObjectId(dto.projectConfigId),
        recipientNumber: r.number,
        templateName: dto.template.name,
        language: dto.language || 'en_US',
        currentStatus: 'queued',
        statusHistory: [{ status: 'queued', timestamp: new Date() }],
      })),
    );

    await this.sessionModel.updateOne(
      { _id: session._id },
      { $inc: { 'counters.queued': messages.length } },
    );

    const queueItems = messages.map((msg, idx) => ({
      data: {
        messageId: msg._id.toString(),
        sessionId: session._id.toString(),
        projectConfigId: dto.projectConfigId,
        recipientNumber: dto.recipients[idx].number,
        templateName: dto.template.name,
        templateComponents: dto.template.components || [],
        params: dto.recipients[idx].params || {},
        language: dto.language || 'en_US',
        type: 'template' as const,
      },
      options: {
        delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
      },
    }));

    await this.queueService.publishBulk(QUEUE_NAMES.MESSAGE_SEND, queueItems);

    return {
      sessionId: session._id,
      totalQueued: messages.length,
    };
  }

  /**
   * Send a free-form text message (no queue, immediate).
   */
  async sendText(dto: SendTextDto) {
    const payload: MessageJobPayload = {
      messageId: '',
      sessionId: '',
      projectConfigId: dto.projectConfigId,
      recipientNumber: dto.number,
      templateName: '',
      templateComponents: [],
      params: {},
      language: 'en_US',
      type: 'text',
      text: dto.text,
    };

    await this.queueService.publish(QUEUE_NAMES.MESSAGE_SEND, payload);

    return { status: true, message: 'Text message queued' };
  }
}
