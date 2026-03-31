import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true, collection: 'tags' })
export class Tag {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ default: '#3B82F6' }) // Default blue color
  color: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
// Ensure a tag name is unique within a project
TagSchema.index({ projectId: 1, name: 1 }, { unique: true });
