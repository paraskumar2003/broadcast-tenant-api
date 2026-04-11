import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConversationDocument = Conversation & Document;

@Schema({ timestamps: true, collection: 'conversations' })
export class Conversation {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Contact', required: true, index: true })
  contactId: Types.ObjectId;

  @Prop({ type:String,required: true, trim: true })
  mobile: string;

  @Prop({
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
    index: true,
  })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  lastMessageId: Types.ObjectId | null;

  @Prop({ type: Date, default: null, index: true })
  lastMessageAt: Date | null;

  @Prop({ type: String, default: '' })
  lastMessageText: string;

  @Prop({ type: Date, default: null })
  conversationWindowExpiresAt: Date | null;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

ConversationSchema.index({ projectId: 1, contactId: 1 });
ConversationSchema.index({ projectId: 1, mobile: 1 });
ConversationSchema.index({ lastMessageAt: -1 });
