import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true, collection: 'messages' })
export class Message {
  @Prop({
    type: Types.ObjectId,
    ref: 'MessageSession',
    required: true,
    index: true,
  })
  sessionId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'ProjectConfiguration',
    required: true,
    index: true,
  })
  projectConfigId: Types.ObjectId;

  @Prop({ required: true, index: true })
  recipientNumber: string;

  @Prop({ index: true, sparse: true })
  metaMessageId: string;

  @Prop({ required: true })
  templateName: string;

  @Prop({ default: 'en_US' })
  language: string;

  @Prop({
    type: String,
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
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
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ sessionId: 1, currentStatus: 1 });
MessageSchema.index({ metaMessageId: 1 });
MessageSchema.index({ createdAt: -1 });
