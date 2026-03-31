import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  MASTER = 'master',
  SUPER = 'super',
  EXECUTIVE = 'executive',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true })
  mobile: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: String, enum: UserRole, required: true, index: true })
  role: UserRole;

  @Prop({ type: String, enum: ['active', 'inactive'], default: 'active', index: true })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
