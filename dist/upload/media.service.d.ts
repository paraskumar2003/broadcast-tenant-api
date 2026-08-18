import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { MediaDocument } from './schemas/media.schema';
import { TaggingService } from '../tagging/tagging.service';
import { MetaApiService } from '../meta-api/meta-api.service';
import { ProjectService } from '../project/project.service';
import { S3Service } from './s3.service';
export declare class MediaService {
    private readonly mediaModel;
    private readonly taggingService;
    private readonly httpService;
    private readonly metaApi;
    private readonly projectService;
    private readonly s3Service;
    constructor(mediaModel: Model<MediaDocument>, taggingService: TaggingService, httpService: HttpService, metaApi: MetaApiService, projectService: ProjectService, s3Service: S3Service);
    presignUpload(projectId: string, filename: string, contentType: string): Promise<{
        uploadUrl: string;
        key: string;
    }>;
    confirmUpload(data: {
        projectId: string;
        key: string;
        filename: string;
        alt?: string;
        mediaType?: string;
    }): Promise<any>;
    listByProject(projectId: string): Promise<any[]>;
    getById(id: string): Promise<MediaDocument>;
    getByIdWithUrl(id: string): Promise<any>;
    private attachUrl;
    update(id: string, data: {
        alt?: string;
        filename?: string;
        mediaType?: string;
    }): Promise<any>;
    delete(id: string): Promise<void>;
    generateMetaHandle(projectId: string, source: {
        mediaId?: string;
        url?: string;
    }): Promise<{
        handle: string;
        url: string;
        contentType: string;
    }>;
    private detectMediaType;
}
