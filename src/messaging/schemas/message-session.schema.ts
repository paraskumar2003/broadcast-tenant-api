import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageSessionDocument = MessageSession & Document;

@Schema({ timestamps: true, collection: 'message_sessions' })
export class MessageSession {
  @Prop({
    type: Types.ObjectId,
    ref: 'ProjectConfiguration',
    required: true,
    index: true,
  })
  projectConfigId: Types.ObjectId;

  @Prop({ required: true })
  templateName: string;

  @Prop({ type: Object })
  templatePayload: Record<string, any>;

  @Prop({ default: 'en_US' })
  language: string;

  @Prop({ required: true })
  totalRecipients: number;

  @Prop({
    type: {
      queued: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      read: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    default: { queued: 0, sent: 0, delivered: 0, read: 0, failed: 0 },
  })
  counters: {
    queued: number;
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  };

  @Prop({
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop({ type: Date, default: null })
  scheduledAt: Date | null;

  @Prop({ type: Date, default: null })
  completedAt: Date | null;
}

export const MessageSessionSchema =
  SchemaFactory.createForClass(MessageSession);
MessageSessionSchema.index({ projectConfigId: 1, status: 1 });
MessageSessionSchema.index({ createdAt: -1 });
