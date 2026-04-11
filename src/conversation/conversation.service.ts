import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { Message, MessageDocument } from '../messaging/schemas/message.schema';

const CONVERSATION_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class ConversationService {
  private readonly logger = new Logger(ConversationService.name);

  constructor(
    @InjectModel(Conversation.name)
    private readonly conversationModel: Model<ConversationDocument>,

    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
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

  async updateLastMessage(
    conversationId: Types.ObjectId,
    messageId: Types.ObjectId,
    text: string,
    timestamp: Date,
  ): Promise<void> {
    await this.conversationModel.updateOne(
      { _id: conversationId },
      {
        $set: {
          lastMessageId: messageId,
          lastMessageAt: timestamp,
          lastMessageText: text || '',
          conversationWindowExpiresAt: new Date(
            timestamp.getTime() + CONVERSATION_WINDOW_MS,
          ),
        },
      },
    );
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
