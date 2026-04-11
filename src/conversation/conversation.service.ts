import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { Message, MessageDocument } from '../messaging/schemas/message.schema';
import { Contact, ContactDocument } from '../contact/schemas/contact.schema';
import { ProjectService } from '../project/project.service';
import type { IQueueService } from '../queue/queue.interface';
import { QUEUE_SERVICE, QUEUE_NAMES } from '../queue/queue.interface';
import type { MessageJobPayload } from '../messaging/messaging.service';

const CONVERSATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,

    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,

    @InjectModel(Contact.name)
    private readonly contactModel: Model<ContactDocument>,

    private readonly projectService: ProjectService,

    @Inject(QUEUE_SERVICE)
    private readonly queueService: IQueueService,
  ) {}

  // ─── Find or Create Conversation ──────────────────────────────────────

  async findOrCreateConversation(
    projectId: Types.ObjectId,
    contactId: Types.ObjectId,
    mobile: string,
  ): Promise<ConversationDocument> {
    const now = new Date();

    // Look for an existing open conversation with a valid window
    const existing = await this.conversationModel.findOne({
      projectId,
      contactId,
      status: 'open',
      conversationWindowExpiresAt: { $gt: now },
    });

    if (existing) return existing;

    // Close any stale open conversations for this contact
    await this.conversationModel.updateMany(
      { projectId, contactId, status: 'open' },
      { $set: { status: 'closed' } },
    );

    // Create a new conversation
    const conversation = await this.conversationModel.create({
      projectId,
      contactId,
      mobile,
      status: 'open',
      conversationWindowExpiresAt: new Date(now.getTime() + CONVERSATION_WINDOW_MS),
    });

    this.logger.debug(
      `New conversation created for contact ${contactId} in project ${projectId}`,
    );

    return conversation;
  }

  // ─── Update Last Message ──────────────────────────────────────────────

  /**
   * Updates conversation metadata.
   * @param extendWindow If true (inbound), resets the 24h window. If false (outbound), leaves it unchanged.
   */
  async updateLastMessage(
    conversationId: Types.ObjectId,
    messageId: Types.ObjectId,
    text: string,
    timestamp: Date,
    extendWindow: boolean = true,
  ): Promise<void> {
    const update: Record<string, any> = {
      lastMessageId: messageId,
      lastMessageAt: timestamp,
      lastMessageText: text || '',
    };

    // Only inbound messages reset the 24h window
    if (extendWindow) {
      update.conversationWindowExpiresAt = new Date(
        timestamp.getTime() + CONVERSATION_WINDOW_MS,
      );
    }

    await this.conversationModel.updateOne(
      { _id: conversationId },
      { $set: update },
    );
  }

  // ─── Send Reply (Outbound Free Message) ───────────────────────────────

  async sendReply(conversationId: string, text: string) {
    // 1. Fetch conversation
    const conversation = await this.conversationModel.findById(conversationId);
    if (!conversation) throw new NotFoundException('Conversation not found');

    // 2. Validate window is still active
    const now = new Date();
    if (
      !conversation.conversationWindowExpiresAt ||
      conversation.conversationWindowExpiresAt <= now
    ) {
      throw new BadRequestException(
        'Conversation window has expired. A template message is required to re-open the conversation.',
      );
    }

    if (conversation.status === 'closed') {
      throw new BadRequestException('Conversation is closed.');
    }

    // 3. Validate contact is active
    const contact = await this.contactModel.findById(conversation.contactId);
    if (!contact || !contact.isActive) {
      throw new BadRequestException('Contact is inactive or not found.');
    }

    // 4. Get project config
    const config = await this.projectService.getConfigurationByProjectId(
      conversation.projectId.toString(),
    );

    // 5. Insert message document (before sending — track even if send fails)
    const message = await this.messageModel.create({
      conversationId: conversation._id,
      contactId: conversation.contactId,
      projectConfigId: conversation.projectId, // follows existing convention
      recipientNumber: conversation.mobile,
      direction: 'outbound',
      messageType: 'text',
      text,
      currentStatus: 'queued',
      statusHistory: [{ status: 'queued', timestamp: now }],
    });

    // 6. Publish to message-send queue (reuses existing MessagingConsumer)
    const payload: MessageJobPayload = {
      messageId: message._id.toString(),
      sessionId: '',
      projectConfigId: conversation.projectId.toString(),
      recipientNumber: conversation.mobile,
      templateName: '',
      templateComponents: [],
      params: {},
      language: 'en_US',
      type: 'text',
      text,
    };

    await this.queueService.publish(QUEUE_NAMES.MESSAGE_SEND, payload);

    // 7. Update conversation last message (do NOT extend window)
    await this.updateLastMessage(
      conversation._id as Types.ObjectId,
      message._id as Types.ObjectId,
      text,
      now,
      false, // outbound does NOT extend the 24h window
    );

    this.logger.debug(
      `Reply queued for conversation ${conversationId} -> ${conversation.mobile}`,
    );

    return { messageId: message._id, conversationId: conversation._id };
  }

  // ─── Close Expired Conversations ──────────────────────────────────────

  async closeExpiredConversations(): Promise<number> {
    const result = await this.conversationModel.updateMany(
      {
        status: 'open',
        conversationWindowExpiresAt: { $lte: new Date() },
      },
      { $set: { status: 'closed' } },
    );
    return result.modifiedCount;
  }

  // ─── List Conversations (Chat UI) ─────────────────────────────────────

  async listConversations(
    projectId: string,
    page: number = 1,
    limit: number = 20,
    status?: string,
  ) {
    const projId = new Types.ObjectId(projectId);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = { projectId: projId };
    if (status) filter.status = status;

    const [conversations, total] = await Promise.all([
      this.conversationModel
        .find(filter)
        .sort({ lastMessageAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('contactId', 'name mobile'),
      this.conversationModel.countDocuments(filter),
    ]);

    return {
      data: conversations,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ─── Get Single Conversation ──────────────────────────────────────────

  async getConversation(id: string) {
    const conversation = await this.conversationModel
      .findById(id)
      .populate('contactId', 'name mobile metadata');
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  // ─── Get Messages for a Conversation ──────────────────────────────────

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const convId = new Types.ObjectId(conversationId);
    const skip = (page - 1) * limit;

    // Verify conversation exists
    const exists = await this.conversationModel.exists({ _id: convId });
    if (!exists) throw new NotFoundException('Conversation not found');

    const [messages, total] = await Promise.all([
      this.messageModel
        .find({ conversationId: convId })
        .sort({ createdAt: 1 }) // ascending for chat view
        .skip(skip)
        .limit(limit),
      this.messageModel.countDocuments({ conversationId: convId }),
    ]);

    return {
      data: messages,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
