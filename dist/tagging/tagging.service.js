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
exports.TaggingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tag_schema_1 = require("./schemas/tag.schema");
const upload_tagging_schema_1 = require("./schemas/upload-tagging.schema");
const template_tagging_schema_1 = require("./schemas/template-tagging.schema");
const contact_tagging_schema_1 = require("./schemas/contact-tagging.schema");
const tagging_dto_1 = require("./dto/tagging.dto");
let TaggingService = class TaggingService {
    tagModel;
    uploadTaggingModel;
    templateTaggingModel;
    contactTaggingModel;
    constructor(tagModel, uploadTaggingModel, templateTaggingModel, contactTaggingModel) {
        this.tagModel = tagModel;
        this.uploadTaggingModel = uploadTaggingModel;
        this.templateTaggingModel = templateTaggingModel;
        this.contactTaggingModel = contactTaggingModel;
    }
    async createTag(dto) {
        try {
            return await this.tagModel.create({
                projectId: new mongoose_2.Types.ObjectId(dto.projectId),
                name: dto.name,
                color: dto.color || '#3B82F6',
            });
        }
        catch (error) {
            if (error.code === 11000) {
                throw new common_1.ConflictException(`Tag with name "${dto.name}" already exists for this project.`);
            }
            throw error;
        }
    }
    async listTagsByProject(projectId) {
        return this.tagModel
            .find({ projectId: new mongoose_2.Types.ObjectId(projectId) })
            .sort({ name: 1 });
    }
    async updateTag(tagId, dto) {
        const updated = await this.tagModel.findByIdAndUpdate(tagId, { $set: dto }, { new: true, runValidators: true });
        if (!updated)
            throw new common_1.NotFoundException('Tag not found');
        return updated;
    }
    async deleteTag(tagId) {
        const deleted = await this.tagModel.findByIdAndDelete(tagId);
        if (!deleted)
            throw new common_1.NotFoundException('Tag not found');
        const tagObjectId = new mongoose_2.Types.ObjectId(tagId);
        await Promise.all([
            this.uploadTaggingModel.deleteMany({ tagId: tagObjectId }),
            this.templateTaggingModel.deleteMany({ tagId: tagObjectId }),
            this.contactTaggingModel.deleteMany({ tagId: tagObjectId }),
        ]);
        return { message: 'Tag and associated mappings deleted successfully' };
    }
    async attachTag(dto) {
        const tagObjectId = new mongoose_2.Types.ObjectId(dto.tagId);
        const projectId = new mongoose_2.Types.ObjectId(dto.projectId);
        const tag = await this.tagModel.findById(tagObjectId);
        if (!tag) {
            throw new common_1.NotFoundException('Tag not found');
        }
        try {
            switch (dto.entityType) {
                case tagging_dto_1.EntityType.UPLOAD:
                    await this.uploadTaggingModel.create({
                        projectId,
                        tagId: tagObjectId,
                        uploadId: new mongoose_2.Types.ObjectId(dto.entityId),
                    });
                    break;
                case tagging_dto_1.EntityType.TEMPLATE:
                    await this.templateTaggingModel.create({
                        projectId,
                        tagId: tagObjectId,
                        templateName: dto.entityId,
                    });
                    break;
                case tagging_dto_1.EntityType.CONTACT:
                    await this.contactTaggingModel.create({
                        projectId,
                        tagId: tagObjectId,
                        contactId: new mongoose_2.Types.ObjectId(dto.entityId),
                    });
                    break;
            }
            return { status: true, message: 'Tag attached successfully' };
        }
        catch (error) {
            if (error.code === 11000) {
                throw new common_1.ConflictException('Tag is already attached to this entity');
            }
            throw error;
        }
    }
    async detachTag(dto) {
        const tagObjectId = new mongoose_2.Types.ObjectId(dto.tagId);
        let result;
        switch (dto.entityType) {
            case tagging_dto_1.EntityType.UPLOAD:
                result = await this.uploadTaggingModel.deleteOne({
                    tagId: tagObjectId,
                    uploadId: new mongoose_2.Types.ObjectId(dto.entityId),
                });
                break;
            case tagging_dto_1.EntityType.TEMPLATE:
                result = await this.templateTaggingModel.deleteOne({
                    tagId: tagObjectId,
                    templateName: dto.entityId,
                });
                break;
            case tagging_dto_1.EntityType.CONTACT:
                result = await this.contactTaggingModel.deleteOne({
                    tagId: tagObjectId,
                    contactId: new mongoose_2.Types.ObjectId(dto.entityId),
                });
                break;
        }
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Tag mapping not found');
        }
        return { status: true, message: 'Tag detached successfully' };
    }
    async getTagsForEntity(projectId, entityType, entityId) {
        const projId = new mongoose_2.Types.ObjectId(projectId);
        let tagIds = [];
        switch (entityType) {
            case tagging_dto_1.EntityType.UPLOAD:
                tagIds = (await this.uploadTaggingModel.find({
                    projectId: projId,
                    uploadId: new mongoose_2.Types.ObjectId(entityId),
                })).map((m) => m.tagId);
                break;
            case tagging_dto_1.EntityType.TEMPLATE:
                tagIds = (await this.templateTaggingModel.find({
                    projectId: projId,
                    templateName: entityId,
                })).map((m) => m.tagId);
                break;
            case tagging_dto_1.EntityType.CONTACT:
                tagIds = (await this.contactTaggingModel.find({
                    projectId: projId,
                    contactId: new mongoose_2.Types.ObjectId(entityId),
                })).map((m) => m.tagId);
                break;
        }
        if (tagIds.length === 0)
            return [];
        return this.tagModel.find({ _id: { $in: tagIds } }).sort({ name: 1 });
    }
    async getEntitiesForTag(tagId, entityType) {
        const tId = new mongoose_2.Types.ObjectId(tagId);
        switch (entityType) {
            case tagging_dto_1.EntityType.UPLOAD:
                return this.uploadTaggingModel.find({ tagId: tId });
            case tagging_dto_1.EntityType.TEMPLATE:
                return this.templateTaggingModel.find({ tagId: tId });
            case tagging_dto_1.EntityType.CONTACT:
                return this.contactTaggingModel.find({ tagId: tId });
        }
    }
    async getTagsForProjectEntities(projectId, entityType) {
        const projId = new mongoose_2.Types.ObjectId(projectId);
        let mappings = [];
        switch (entityType) {
            case tagging_dto_1.EntityType.UPLOAD:
                mappings = await this.uploadTaggingModel
                    .find({ projectId: projId })
                    .populate('tagId');
                break;
            case tagging_dto_1.EntityType.TEMPLATE:
                mappings = await this.templateTaggingModel
                    .find({ projectId: projId })
                    .populate('tagId');
                break;
            case tagging_dto_1.EntityType.CONTACT:
                mappings = await this.contactTaggingModel
                    .find({ projectId: projId })
                    .populate('tagId');
                break;
        }
        const resultMap = {};
        for (const mapping of mappings) {
            let entityId = '';
            if (entityType === tagging_dto_1.EntityType.UPLOAD && mapping.uploadId) {
                entityId = mapping.uploadId.toString();
            }
            else if (entityType === tagging_dto_1.EntityType.TEMPLATE && mapping.templateName) {
                entityId = mapping.templateName;
            }
            else if (entityType === tagging_dto_1.EntityType.CONTACT && mapping.contactId) {
                entityId = mapping.contactId.toString();
            }
            if (!entityId)
                continue;
            if (!resultMap[entityId]) {
                resultMap[entityId] = [];
            }
            if (mapping.tagId) {
                resultMap[entityId].push(mapping.tagId);
            }
        }
        return resultMap;
    }
};
exports.TaggingService = TaggingService;
exports.TaggingService = TaggingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tag_schema_1.Tag.name)),
    __param(1, (0, mongoose_1.InjectModel)(upload_tagging_schema_1.UploadTagging.name)),
    __param(2, (0, mongoose_1.InjectModel)(template_tagging_schema_1.TemplateTagging.name)),
    __param(3, (0, mongoose_1.InjectModel)(contact_tagging_schema_1.ContactTagging.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], TaggingService);
//# sourceMappingURL=tagging.service.js.map