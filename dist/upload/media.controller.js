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
exports.MediaController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const media_service_1 = require("./media.service");
const media_dto_1 = require("./dto/media.dto");
let MediaController = class MediaController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async presign(dto) {
        const data = await this.mediaService.presignUpload(dto.projectId, dto.filename, dto.contentType);
        return api_response_dto_1.ApiResponseDto.success('Presigned upload URL generated', data);
    }
    async confirm(dto) {
        const data = await this.mediaService.confirmUpload(dto);
        return api_response_dto_1.ApiResponseDto.success('Media uploaded', data);
    }
    async listByProject(projectId) {
        const data = await this.mediaService.listByProject(projectId);
        return api_response_dto_1.ApiResponseDto.success('Media gallery fetched', data);
    }
    async getMetaHandle(dto) {
        const data = await this.mediaService.generateMetaHandle(dto.projectId, {
            mediaId: dto.mediaId,
            url: dto.url,
        });
        return api_response_dto_1.ApiResponseDto.success('Meta media handle generated', data);
    }
    async getById(id) {
        const data = await this.mediaService.getByIdWithUrl(id);
        return api_response_dto_1.ApiResponseDto.success('Media fetched', data);
    }
    async update(id, dto) {
        const data = await this.mediaService.update(id, dto);
        return api_response_dto_1.ApiResponseDto.success('Media updated', data);
    }
    async delete(id) {
        await this.mediaService.delete(id);
        return api_response_dto_1.ApiResponseDto.success('Media deleted');
    }
};
exports.MediaController = MediaController;
__decorate([
    (0, common_1.Post)('presign'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Get a short-lived URL to upload a file directly to S3 (private bucket)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.PresignMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "presign", null);
__decorate([
    (0, common_1.Post)('confirm'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm a direct S3 upload and add it to the project gallery' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.ConfirmMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "confirm", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'List all media for a project (gallery)' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "listByProject", null);
__decorate([
    (0, common_1.Post)('meta-handle'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Upload media to Meta via the Resumable Upload API and return a header handle usable in template example.header_handle',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [media_dto_1.MetaHandleDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getMetaHandle", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single media item by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Update media metadata (alt, filename, mediaType)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, media_dto_1.UpdateMediaDto]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a media item (soft delete)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MediaController.prototype, "delete", null);
exports.MediaController = MediaController = __decorate([
    (0, swagger_1.ApiTags)('Media Gallery'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('media'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], MediaController);
//# sourceMappingURL=media.controller.js.map