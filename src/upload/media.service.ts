import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model, Types } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { Media, MediaDocument } from './schemas/media.schema';
import { TaggingService } from '../tagging/tagging.service';
import { EntityType } from '../tagging/dto/tagging.dto';
import { MetaApiService } from '../meta-api/meta-api.service';
import { ProjectService } from '../project/project.service';
import { S3Service } from './s3.service';

@Injectable()
export class MediaService {
    constructor(
        @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>,
        private readonly taggingService: TaggingService,
        private readonly httpService: HttpService,
        private readonly metaApi: MetaApiService,
        private readonly projectService: ProjectService,
        private readonly s3Service: S3Service,
    ) { }

    // ─── Direct-to-S3 upload flow (bucket is private) ──────────────────

    /** Step 1: mint a short-lived URL the browser can PUT the file to directly. */
    async presignUpload(
        projectId: string,
        filename: string,
        contentType: string,
    ): Promise<{ uploadUrl: string; key: string }> {
        const key = this.s3Service.buildKey(filename);
        const uploadUrl = await this.s3Service.getPresignedPutUrl(key, contentType);
        return { uploadUrl, key };
    }

    /** Step 2: after the browser PUTs the bytes, verify + register the gallery item. */
    async confirmUpload(data: {
        projectId: string;
        key: string;
        filename: string;
        alt?: string;
        mediaType?: string;
    }): Promise<any> {
        const { contentType, size } = await this.s3Service.headObject(data.key);

        const media = await this.mediaModel.create({
            projectId: new Types.ObjectId(data.projectId),
            key: data.key,
            filename: data.filename,
            contentType,
            size,
            alt: data.alt || '',
            mediaType: data.mediaType || this.detectMediaType(contentType),
        });

        return this.attachUrl(media.toObject());
    }

    // ─── Reads ──────────────────────────────────────────────────────────

    async listByProject(projectId: string): Promise<any[]> {
        const mediaList = await this.mediaModel
            .find({ projectId: new Types.ObjectId(projectId), status: 'active' })
            .sort({ createdAt: -1 })
            .lean();

        const tagsMap = await this.taggingService.getTagsForProjectEntities(projectId, EntityType.UPLOAD);

        const withUrls = await Promise.all(mediaList.map((media) => this.attachUrl(media)));
        return withUrls.map((media) => ({
            ...media,
            tags: tagsMap[media._id.toString()] || [],
        }));
    }

    async getById(id: string): Promise<MediaDocument> {
        const media = await this.mediaModel.findOne({ _id: id, status: 'active' });
        if (!media) throw new NotFoundException('Media not found');
        return media;
    }

    async getByIdWithUrl(id: string): Promise<any> {
        const media = await this.getById(id);
        return this.attachUrl(media.toObject());
    }

    /** Attaches a freshly-minted, short-lived presigned GET URL — never persisted. */
    private async attachUrl(media: any): Promise<any> {
        return { ...media, url: await this.s3Service.getPresignedGetUrl(media.key) };
    }

    async update(id: string, data: { alt?: string; filename?: string; mediaType?: string }): Promise<any> {
        const media = await this.mediaModel.findOneAndUpdate(
            { _id: id, status: 'active' },
            { $set: data },
            { new: true },
        );
        if (!media) throw new NotFoundException('Media not found');
        return this.attachUrl(media.toObject());
    }

    async delete(id: string): Promise<void> {
        const result = await this.mediaModel.findByIdAndUpdate(id, { status: 'deleted' });
        if (!result) throw new NotFoundException('Media not found');
    }

    /**
     * Resolve a gallery item (or arbitrary external URL) to a Meta template
     * header handle by fetching the bytes and running Meta's Resumable
     * Upload API. This handle is what WhatsApp's template creation API
     * expects in `example.header_handle` — a raw media URL is not accepted
     * there, and our bucket is private besides.
     */
    async generateMetaHandle(
        projectId: string,
        source: { mediaId?: string; url?: string },
    ): Promise<{ handle: string; url: string; contentType: string }> {
        const config = await this.projectService.getConfigurationByProjectId(projectId);
        if (!config.metaAppId) {
            throw new BadRequestException(
                'Meta App ID is not configured for this project. Add it under Configurations before selecting media for a template header.',
            );
        }

        let fileBuffer: Buffer;
        let contentType: string;
        let previewUrl: string;

        if (source.mediaId) {
            const media = await this.getById(source.mediaId);
            fileBuffer = await this.s3Service.getObjectBuffer(media.key);
            contentType = media.contentType;
            previewUrl = await this.s3Service.getPresignedGetUrl(media.key);
        } else if (source.url) {
            try {
                const { data, headers } = await firstValueFrom(
                    this.httpService.get(source.url, { responseType: 'arraybuffer' }),
                );
                fileBuffer = Buffer.from(data);
                contentType = headers['content-type'];
            } catch {
                throw new BadRequestException(`Failed to fetch media from ${source.url}`);
            }
            if (!contentType) {
                throw new BadRequestException('Could not determine media content type');
            }
            previewUrl = source.url;
        } else {
            throw new BadRequestException('Either mediaId or url is required');
        }

        const handle = await this.metaApi.uploadMediaForHandle(
            config.metaAppId,
            config.accessToken,
            fileBuffer,
            contentType,
        );

        return { handle, url: previewUrl, contentType };
    }

    private detectMediaType(contentType: string): string {
        if (contentType.startsWith('image/')) return 'image';
        if (contentType.startsWith('video/')) return 'video';
        if (contentType.startsWith('application/') || contentType.startsWith('text/')) return 'document';
        return 'other';
    }
}
