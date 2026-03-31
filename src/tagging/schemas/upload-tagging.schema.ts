import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UploadTaggingDocument = UploadTagging & Document;

@Schema({ timestamps: true, collection: 'upload_taggings' })
export class UploadTagging {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Tag', required: true, index: true })
  tagId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Media', required: true, index: true })
  uploadId: Types.ObjectId;
}

export const UploadTaggingSchema = SchemaFactory.createForClass(UploadTagging);
UploadTaggingSchema.index({ tagId: 1, uploadId: 1 }, { unique: true });
