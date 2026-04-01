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
const mongoose_2 = require("mongoose");
const media_schema_1 = require("./schemas/media.schema");
const tagging_service_1 = require("../tagging/tagging.service");
const tagging_dto_1 = require("../tagging/dto/tagging.dto");
let MediaService = class MediaService {
    mediaModel;
    taggingService;
    constructor(mediaModel, taggingService) {
        this.mediaModel = mediaModel;
        this.taggingService = taggingService;
    }
    async create(data) {
        return this.mediaModel.create({
            projectId: new mongoose_2.Types.ObjectId(data.projectId),
            url: data.url,
            key: data.key,
            filename: data.filename,
            contentType: data.contentType,
            size: data.size,
            alt: data.alt || '',
            mediaType: data.mediaType || this.detectMediaType(data.contentType),
        });
    }
    async createMany(items) {
        const docs = items.map((item) => ({
            projectId: new mongoose_2.Types.ObjectId(item.projectId),
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
    async listByProject(projectId) {
        const mediaList = await this.mediaModel
            .find({ projectId: new mongoose_2.Types.ObjectId(projectId), status: 'active' })
            .sort({ createdAt: -1 })
            .lean();
        const tagsMap = await this.taggingService.getTagsForProjectEntities(projectId, tagging_dto_1.EntityType.UPLOAD);
        return mediaList.map(media => ({
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
    async update(id, data) {
        const media = await this.mediaModel.findOneAndUpdate({ _id: id, status: 'active' }, { $set: data }, { new: true });
        if (!media)
            throw new common_1.NotFoundException('Media not found');
        return media;
    }
    async delete(id) {
        const result = await this.mediaModel.findByIdAndUpdate(id, { status: 'deleted' });
        if (!result)
            throw new common_1.NotFoundException('Media not found');
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
        tagging_service_1.TaggingService])
], MediaService);
//# sourceMappingURL=media.service.js.map