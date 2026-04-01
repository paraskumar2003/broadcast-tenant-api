import { Model } from 'mongoose';
import { MediaDocument } from './schemas/media.schema';
import { TaggingService } from '../tagging/tagging.service';
export declare class MediaService {
    private readonly mediaModel;
    private readonly taggingService;
    constructor(mediaModel: Model<MediaDocument>, taggingService: TaggingService);
    create(data: {
        projectId: string;
        url: string;
        key: string;
        filename: string;
        contentType: string;
        size: number;
        alt?: string;
        mediaType?: string;
    }): Promise<MediaDocument>;
    createMany(items: Array<{
        projectId: string;
        url: string;
        key: string;
        filename: string;
        contentType: string;
        size: number;
        alt?: string;
        mediaType?: string;
    }>): Promise<MediaDocument[]>;
    listByProject(projectId: string): Promise<any[]>;
    getById(id: string): Promise<MediaDocument>;
    update(id: string, data: {
        alt?: string;
        filename?: string;
        mediaType?: string;
    }): Promise<MediaDocument>;
    delete(id: string): Promise<void>;
    private detectMediaType;
}
