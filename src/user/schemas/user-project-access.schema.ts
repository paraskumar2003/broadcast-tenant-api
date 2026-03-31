import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProjectAccessDocument = UserProjectAccess & Document;

@Schema({ timestamps: true, collection: 'user_project_access' })
export class UserProjectAccess {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  grantedBy: Types.ObjectId;
}

export const UserProjectAccessSchema = SchemaFactory.createForClass(UserProjectAccess);
UserProjectAccessSchema.index({ userId: 1, projectId: 1 }, { unique: true });
