import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TemplateTaggingDocument = TemplateTagging & Document;

@Schema({ timestamps: true, collection: 'template_taggings' })
export class TemplateTagging {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tag', required: true, index: true })
  tagId: Types.ObjectId;

  @Prop({ required: true, index: true })
  templateName: string;
}

export const TemplateTaggingSchema =
  SchemaFactory.createForClass(TemplateTagging);
TemplateTaggingSchema.index({ tagId: 1, templateName: 1 }, { unique: true });
