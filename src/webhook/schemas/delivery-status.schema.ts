import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliveryStatusDocument = DeliveryStatus & Document;

@Schema({ timestamps: true, collection: 'delivery_statuses' })
export class DeliveryStatus {
  @Prop({ required: true, index: true })
  wabaId: string;

  @Prop({ required: true, index: true })
  metaMessageId: string;

  @Prop({ required: true })
  recipientNumber: string;

  @Prop({
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed'],
    required: true,
    index: true,
  })
  status: string;

  @Prop({ type: Number, default: null })
  errorCode: number | null;

  @Prop({ type: String, default: null })
  errorTitle: string | null;

  @Prop({ type: Date, required: true })
  timestamp: Date;

  @Prop({ type: Object })
  rawPayload: Record<string, any>;
}

export const DeliveryStatusSchema = SchemaFactory.createForClass(DeliveryStatus);
DeliveryStatusSchema.index({ wabaId: 1, timestamp: -1 });
