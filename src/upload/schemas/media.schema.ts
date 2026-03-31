import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MediaDocument = Media & Document;

@Schema({ timestamps: true })
export class Media {
    @Prop({ type: Types.ObjectId, ref: 'Project', required: true, index: true })
    projectId: Types.ObjectId;

    @Prop({ required: true })
    url: string;

    @Prop({ required: true })
    key: string;

    @Prop({ required: true })
    filename: string;

    @Prop({ required: true })
    contentType: string;

    @Prop({ default: 0 })
    size: number;

    @Prop({ default: '' })
    alt: string;

    @Prop({ type: String, enum: ['image', 'video', 'document', 'other'], default: 'other' })
    mediaType: string;

    @Prop({ type: String, enum: ['active', 'deleted'], default: 'active' })
    status: string;
}

export const MediaSchema = SchemaFactory.createForClass(Media);
