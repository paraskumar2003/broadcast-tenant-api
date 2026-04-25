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
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const contact_service_1 = require("./contact.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const contact_dto_1 = require("./dto/contact.dto");
let ContactController = class ContactController {
    contactService;
    constructor(contactService) {
        this.contactService = contactService;
    }
    async create(dto) {
        const data = await this.contactService.create(dto);
        return api_response_dto_1.ApiResponseDto.success('Contact created successfully', data);
    }
    async tagsSummary(projectId) {
        const data = await this.contactService.getTagsSummary(projectId);
        return api_response_dto_1.ApiResponseDto.success('Tags summary fetched', data);
    }
    async listByProject(projectId, query) {
        const data = await this.contactService.findByProject(projectId, query);
        return api_response_dto_1.ApiResponseDto.success('Contacts fetched successfully', data);
    }
    async downloadSampleCsv(res) {
        const buffer = this.contactService.getSampleCsvBuffer();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="contacts_sample.csv"');
        res.send(buffer);
    }
    async importCsv(file, projectId) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        if (!projectId)
            throw new common_1.BadRequestException('projectId is required');
        if (!file.originalname.endsWith('.csv')) {
            throw new common_1.BadRequestException('Only .csv files are accepted');
        }
        const result = await this.contactService.importFromCsv(projectId, file.buffer);
        return api_response_dto_1.ApiResponseDto.success('CSV import complete', result);
    }
    async getById(id) {
        const data = await this.contactService.findById(id);
        return api_response_dto_1.ApiResponseDto.success('Contact fetched', data);
    }
    async update(id, dto) {
        const data = await this.contactService.update(id, dto);
        return api_response_dto_1.ApiResponseDto.success('Contact updated successfully', data);
    }
    async delete(id) {
        const data = await this.contactService.delete(id);
        return api_response_dto_1.ApiResponseDto.success(data.message);
    }
    async reactivate(id) {
        const data = await this.contactService.reactivate(id);
        return api_response_dto_1.ApiResponseDto.success(data.message, data.contact);
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a single contact for a project' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_dto_1.CreateContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('project/:projectId/tags-summary'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all tags for a project with the count of active contacts mapped to each tag',
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "tagsSummary", null);
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({
        summary: 'List all active contacts for a project (paginated, optional tag filter)',
    }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_dto_1.ListContactsQueryDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "listByProject", null);
__decorate([
    (0, common_1.Get)('sample-csv'),
    (0, swagger_1.ApiOperation)({
        summary: 'Download a sample CSV file showing the expected import format',
    }),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "downloadSampleCsv", null);
__decorate([
    (0, common_1.Post)('import/csv'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Bulk import contacts from a CSV file (columns: name, mobile, tags). Tags column accepts comma-separated tag names.',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'CSV file' },
                projectId: { type: 'string', example: '6482c4adda0e29b69bfec072' },
            },
            required: ['file', 'projectId'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "importCsv", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single contact by ID (with attached tags)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Update a contact' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, contact_dto_1.UpdateContactDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete a contact (sets isActive = false)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "delete", null);
__decorate([
    (0, common_1.Patch)(':id/reactivate'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate a soft-deleted contact (sets isActive = true)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "reactivate", null);
exports.ContactController = ContactController = __decorate([
    (0, swagger_1.ApiTags)('Contacts'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [contact_service_1.ContactService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map