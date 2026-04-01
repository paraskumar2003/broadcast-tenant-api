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
exports.TaggingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tagging_service_1 = require("./tagging.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const tagging_dto_1 = require("./dto/tagging.dto");
let TaggingController = class TaggingController {
    taggingService;
    constructor(taggingService) {
        this.taggingService = taggingService;
    }
    async createTag(dto) {
        const data = await this.taggingService.createTag(dto);
        return api_response_dto_1.ApiResponseDto.success('Tag created successfully', data);
    }
    async listTags(projectId) {
        const data = await this.taggingService.listTagsByProject(projectId);
        return api_response_dto_1.ApiResponseDto.success('Tags fetched successfully', data);
    }
    async updateTag(id, dto) {
        const data = await this.taggingService.updateTag(id, dto);
        return api_response_dto_1.ApiResponseDto.success('Tag updated successfully', data);
    }
    async deleteTag(id) {
        const data = await this.taggingService.deleteTag(id);
        return api_response_dto_1.ApiResponseDto.success(data.message);
    }
    async attachTag(dto) {
        const data = await this.taggingService.attachTag(dto);
        return api_response_dto_1.ApiResponseDto.success(data.message);
    }
    async detachTag(dto) {
        const data = await this.taggingService.detachTag(dto);
        return api_response_dto_1.ApiResponseDto.success(data.message);
    }
    async getEntityTags(projectId, entityType, entityId) {
        const data = await this.taggingService.getTagsForEntity(projectId, entityType, entityId);
        return api_response_dto_1.ApiResponseDto.success('Entity tags fetched successfully', data);
    }
};
exports.TaggingController = TaggingController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new tag for a project' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tagging_dto_1.CreateTagDto]),
    __metadata("design:returntype", Promise)
], TaggingController.prototype, "createTag", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'List all tags for a project' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaggingController.prototype, "listTags", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Update a tag' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, tagging_dto_1.UpdateTagDto]),
    __metadata("design:returntype", Promise)
], TaggingController.prototype, "updateTag", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a tag (cascades to entity mappings)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TaggingController.prototype, "deleteTag", null);
__decorate([
    (0, common_1.Post)('attach'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Attach a tag to an entity (upload, template, contact)',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tagging_dto_1.AttachDetachTagDto]),
    __metadata("design:returntype", Promise)
], TaggingController.prototype, "attachTag", null);
__decorate([
    (0, common_1.Post)('detach'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Detach a tag from an entity' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [tagging_dto_1.AttachDetachTagDto]),
    __metadata("design:returntype", Promise)
], TaggingController.prototype, "detachTag", null);
__decorate([
    (0, common_1.Get)('entity/:projectId/:entityType/:entityId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all tags attached to a specific entity' }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TaggingController.prototype, "getEntityTags", null);
exports.TaggingController = TaggingController = __decorate([
    (0, swagger_1.ApiTags)('Tagging'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('tags'),
    __metadata("design:paramtypes", [tagging_service_1.TaggingService])
], TaggingController);
//# sourceMappingURL=tagging.controller.js.map