import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Media, MediaDocument } from './schemas/media.schema';
import { TaggingService } from '../tagging/tagging.service';
import { EntityType } from '../tagging/dto/tagging.dto';

@Injectable()
export class MediaService {
    constructor(
        @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
        private readonly taggingService: TaggingService,
    ) { }

    async create(data: {
        projectId: string;
        url: string;
        key: string;
        filename: string;
        contentType: string;
        size: number;
        alt?: string;
        mediaType?: string;
    }): Promise<MediaDocument> {
        return this.mediaModel.create({
            projectId: new Types.ObjectId(data.projectId),
            url: data.url,
            key: data.key,
            filename: data.filename,
            contentType: data.contentType,
            size: data.size,
            alt: data.alt || '',
            mediaType: data.mediaType || this.detectMediaType(data.contentType),
        });
    }

    async createMany(items: Array<{
        projectId: string;
        url: string;
        key: string;
        filename: string;
        contentType: string;
        size: number;
        alt?: string;
        mediaType?: string;
    }>): Promise<MediaDocument[]> {
        const docs = items.map((item) => ({
            projectId: new Types.ObjectId(item.projectId),
            url: item.url,
            key: item.key,
            filename: item.filename,
            contentType: item.contentType,
            size: item.size,
            alt: item.alt || '',
            mediaType: item.mediaType || this.detectMediaType(item.contentType),
        }));
        return this.mediaModel.insertMany(docs);
    }

    async listByProject(projectId: string): Promise<any[]> {
        const mediaList = await this.mediaModel
            .find({ projectId: new Types.ObjectId(projectId), status: 'active' })
            .sort({ createdAt: -1 })
            .lean();

        const tagsMap = await this.taggingService.getTagsForProjectEntities(projectId, EntityType.UPLOAD);

        return mediaList.map(media => ({
            ...media,
            tags: tagsMap[media._id.toString()] || [],
        }));
    }

    async getById(id: string): Promise<MediaDocument> {
        const media = await this.mediaModel.findOne({ _id: id, status: 'active' });
        if (!media) throw new NotFoundException('Media not found');
        return media;
    }

    async update(id: string, data: { alt?: string; filename?: string; mediaType?: string }): Promise<MediaDocument> {
        const media = await this.mediaModel.findOneAndUpdate(
            { _id: id, status: 'active' },
            { $set: data },
            { new: true },
        );
        if (!media) throw new NotFoundException('Media not found');
        return media;
    }

    async delete(id: string): Promise<void> {
        const result = await this.mediaModel.findByIdAndUpdate(id, { status: 'deleted' });
        if (!result) throw new NotFoundException('Media not found');
    }

    private detectMediaType(contentType: string): string {
        if (contentType.startsWith('image/')) return 'image';
        if (contentType.startsWith('video/')) return 'video';
        if (contentType.startsWith('application/') || contentType.startsWith('text/')) return 'document';
        return 'other';
    }
}
