import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'MessageSession',
    index: true,
    default: null,
  })
  sessionId: Types.ObjectId | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'Broadcast',
    index: true,
    default: null,
  })
  broadcastId: Types.ObjectId | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'ProjectConfiguration',
    required: true,
    index: true,
  })
  projectConfigId: Types.ObjectId;

  @Prop({ required: true, index: true })
  recipientNumber: string;

  @Prop({ index: true, sparse: true, unique: true })
  metaMessageId: string;

  @Prop({ type: String, default: null })
  templateName: string | null;

  @Prop({ type: String, default: 'en_US' })
  language: string;

  @Prop({
    type: String,
    enum: ['queued', 'sent', 'delivered', 'read', 'failed', 'received'],
    default: 'queued',
    index: true,
  })
  currentStatus: string;

  @Prop({
    type: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, required: true },
        raw: { type: Object },
      },
    ],
    default: [],
  })
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    raw?: Record<string, any>;
  }>;

  @Prop({ type: Object, default: null })
  errorDetails: Record<string, any> | null;

  // ─── Conversation Fields ──────────────────────────────────────────────

  @Prop({
    type: Types.ObjectId,
    ref: 'Conversation',
    index: true,
    default: null,
  })
  conversationId: Types.ObjectId | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'Contact',
    index: true,
    default: null,
  })
  contactId: Types.ObjectId | null;

  @Prop({
    type: String,
    enum: ['inbound', 'outbound'],
    default: 'outbound',
  })
  direction: string;

  @Prop({
    type: String,
    enum: ['text', 'image', 'document', 'template', 'audio', 'video', 'sticker', 'location', 'contacts', 'reaction', 'unknown'],
    default: 'template',
  })
  messageType: string;

  @Prop({ type: String, default: null })
  text: string | null;

  @Prop({ type: String, default: null })
  mediaUrl: string | null;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ sessionId: 1, currentStatus: 1 });
MessageSchema.index({ metaMessageId: 1 }, { unique: true, sparse: true });
MessageSchema.index({ conversationId: 1, createdAt: 1 });
MessageSchema.index({ createdAt: -1 });
// Reports compound indexes (projectConfigId-scoped)
MessageSchema.index({ projectConfigId: 1, createdAt: -1 });
MessageSchema.index({ projectConfigId: 1, currentStatus: 1, createdAt: -1 });
MessageSchema.index({ projectConfigId: 1, broadcastId: 1, createdAt: -1 });
MessageSchema.index({ projectConfigId: 1, recipientNumber: 1, createdAt: -1 });
MessageSchema.index({ projectConfigId: 1, templateName: 1, createdAt: -1 });
