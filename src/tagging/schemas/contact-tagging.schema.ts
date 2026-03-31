import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ContactTaggingDocument = ContactTagging & Document;

@Schema({ timestamps: true, collection: 'contact_taggings' })
export class ContactTagging {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tag', required: true, index: true })
  tagId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, index: true }) // Ref to future 'Contact'
  contactId: Types.ObjectId;
}

export const ContactTaggingSchema =
  SchemaFactory.createForClass(ContactTagging);
ContactTaggingSchema.index({ tagId: 1, contactId: 1 }, { unique: true });
