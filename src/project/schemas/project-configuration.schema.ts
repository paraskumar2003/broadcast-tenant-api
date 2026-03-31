import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectConfigurationDocument = ProjectConfiguration & Document;

@Schema({ timestamps: true, collection: 'project_configurations' })
export class ProjectConfiguration {
  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  whatsappBusinessAccountId: string;

  @Prop({ required: true, trim: true })
  phoneNumberId: string;

  @Prop({ trim: true })
  phoneNumber: string;

  @Prop({ required: true })
  accessToken: string;

  @Prop({ trim: true })
  logo: string;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active' })
  status: string;
}

export const ProjectConfigurationSchema = SchemaFactory.createForClass(ProjectConfiguration);
