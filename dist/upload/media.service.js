"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const axios_1 = require("@nestjs/axios");
const mongoose_2 = require("mongoose");
const rxjs_1 = require("rxjs");
const media_schema_1 = require("./schemas/media.schema");
const tagging_service_1 = require("../tagging/tagging.service");
const tagging_dto_1 = require("../tagging/dto/tagging.dto");
const meta_api_service_1 = require("../meta-api/meta-api.service");
const project_service_1 = require("../project/project.service");
const s3_service_1 = require("./s3.service");
let MediaService = class MediaService {
    mediaModel;
    taggingService;
    httpService;
    metaApi;
    projectService;
    s3Service;
    constructor(mediaModel, taggingService, httpService, metaApi, projectService, s3Service) {
        this.mediaModel = mediaModel;
        this.taggingService = taggingService;
        this.httpService = httpService;
        this.metaApi = metaApi;
        this.projectService = projectService;
        this.s3Service = s3Service;
    }
    async presignUpload(projectId, filename, contentType) {
        const key = this.s3Service.buildKey(filename);
        const uploadUrl = await this.s3Service.getPresignedPutUrl(key, contentType);
        return { uploadUrl, key };
    }
    async confirmUpload(data) {
        const { contentType, size } = await this.s3Service.headObject(data.key);
        const media = await this.mediaModel.create({
            projectId: new mongoose_2.Types.ObjectId(data.projectId),
            key: data.key,
            filename: data.filename,
            contentType,
            size,
            alt: data.alt || '',
            mediaType: data.mediaType || this.detectMediaType(contentType),
        });
        return this.attachUrl(media.toObject());
    }
    async listByProject(projectId) {
        const mediaList = await this.mediaModel
            .find({ projectId: new mongoose_2.Types.ObjectId(projectId), status: 'active' })
            .sort({ createdAt: -1 })
            .lean();
        const tagsMap = await this.taggingService.getTagsForProjectEntities(projectId, tagging_dto_1.EntityType.UPLOAD);
        const withUrls = await Promise.all(mediaList.map((media) => this.attachUrl(media)));
        return withUrls.map((media) => ({
            ...media,
            tags: tagsMap[media._id.toString()] || [],
        }));
    }
    async getById(id) {
        const media = await this.mediaModel.findOne({ _id: id, status: 'active' });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        return media;
    }
    async getByIdWithUrl(id) {
        const media = await this.getById(id);
        return this.attachUrl(media.toObject());
    }
    async attachUrl(media) {
        return { ...media, url: await this.s3Service.getPresignedGetUrl(media.key) };
    }
    async update(id, data) {
        const media = await this.mediaModel.findOneAndUpdate({ _id: id, status: 'active' }, { $set: data }, { new: true });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        return this.attachUrl(media.toObject());
    }
    async delete(id) {
        const result = await this.mediaModel.findByIdAndUpdate(id, { status: 'deleted' });
        if (!result)
            throw new common_1.NotFoundException('Media not found');
    }
    async generateMetaHandle(projectId, source) {
        const config = await this.projectService.getConfigurationByProjectId(projectId);
        if (!config.metaAppId) {
            throw new common_1.BadRequestException('Meta App ID is not configured for this project. Add it under Configurations before selecting media for a template header.');
        }
        let fileBuffer;
        let contentType;
        let previewUrl;
        if (source.mediaId) {
            const media = await this.getById(source.mediaId);
            fileBuffer = await this.s3Service.getObjectBuffer(media.key);
            contentType = media.contentType;
            previewUrl = await this.s3Service.getPresignedGetUrl(media.key);
        }
        else if (source.url) {
            try {
                const { data, headers } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(source.url, { responseType: 'arraybuffer' }));
                fileBuffer = Buffer.from(data);
                contentType = headers['content-type'];
            }
            catch {
                throw new common_1.BadRequestException(`Failed to fetch media from ${source.url}`);
            }
            if (!contentType) {
                throw new common_1.BadRequestException('Could not determine media content type');
            }
            previewUrl = source.url;
        }
        else {
            throw new common_1.BadRequestException('Either mediaId or url is required');
        }
        const handle = await this.metaApi.uploadMediaForHandle(config.metaAppId, config.accessToken, fileBuffer, contentType);
        return { handle, url: previewUrl, contentType };
    }
    detectMediaType(contentType) {
        if (contentType.startsWith('image/'))
            return 'image';
        if (contentType.startsWith('video/'))
            return 'video';
        if (contentType.startsWith('application/') || contentType.startsWith('text/'))
            return 'document';
        return 'other';
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(media_schema_1.Media.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        tagging_service_1.TaggingService,
        axios_1.HttpService,
        meta_api_service_1.MetaApiService,
        project_service_1.ProjectService,
        s3_service_1.S3Service])
], MediaService);
//# sourceMappingURL=media.service.js.map