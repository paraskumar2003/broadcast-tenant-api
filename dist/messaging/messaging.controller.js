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
exports.MessagingController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const swagger_1 = require("@nestjs/swagger");
const messaging_service_1 = require("./messaging.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const send_message_dto_1 = require("./dto/send-message.dto");
let MessagingController = class MessagingController {
    messagingService;
    constructor(messagingService) {
        this.messagingService = messagingService;
    }
    async sendSingle(dto) {
        const data = await this.messagingService.sendSingle(dto);
        return api_response_dto_1.ApiResponseDto.success('Message queued successfully', data);
    }
    async sendBulk(dto) {
        const data = await this.messagingService.sendBulk(dto);
        return api_response_dto_1.ApiResponseDto.success('Bulk messages queued successfully', data);
    }
    async sendBulkCsv(file, projectConfigId, templateStr, language, scheduledAt) {
        if (!file)
            throw new common_1.BadRequestException('No CSV file provided');
        if (!projectConfigId)
            throw new common_1.BadRequestException('projectConfigId is required');
        if (!templateStr)
            throw new common_1.BadRequestException('template is required');
        if (!file.originalname.endsWith('.csv')) {
            throw new common_1.BadRequestException('Only .csv files are accepted');
        }
        let template;
        try {
            template = JSON.parse(templateStr);
        }
        catch {
            throw new common_1.BadRequestException('template must be valid JSON');
        }
        const data = await this.messagingService.sendBulkCsv({
            fileBuffer: file.buffer,
            projectConfigId,
            template,
            language,
            scheduledAt,
        });
        return api_response_dto_1.ApiResponseDto.success('CSV broadcast queued', data);
    }
    async sendText(dto) {
        const data = await this.messagingService.sendText(dto);
        return api_response_dto_1.ApiResponseDto.success('Text message queued', data);
    }
};
exports.MessagingController = MessagingController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a template message to a single recipient' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendSingleDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "sendSingle", null);
__decorate([
    (0, common_1.Post)('send-bulk'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a template message to multiple recipients (by numbers and/or tags)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendBulkDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "sendBulk", null);
__decorate([
    (0, common_1.Post)('send-bulk-csv'),
    (0, swagger_1.ApiOperation)({
        summary: 'Send a template message to recipients from a CSV file (with optional contact sync)',
    }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary', description: 'CSV file with mobile column' },
                projectConfigId: { type: 'string' },
                template: { type: 'string', description: 'Template JSON (stringified)' },
                language: { type: 'string', default: 'en_US' },
                scheduledAt: { type: 'string', description: 'ISO date string (optional)' },
            },
            required: ['file', 'projectConfigId', 'template'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('projectConfigId')),
    __param(2, (0, common_1.Body)('template')),
    __param(3, (0, common_1.Body)('language')),
    __param(4, (0, common_1.Body)('scheduledAt')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "sendBulkCsv", null);
__decorate([
    (0, common_1.Post)('send-text'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a free-form text message' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [send_message_dto_1.SendTextDto]),
    __metadata("design:returntype", Promise)
], MessagingController.prototype, "sendText", null);
exports.MessagingController = MessagingController = __decorate([
    (0, swagger_1.ApiTags)('Messaging'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, common_1.Controller)('messages'),
    __metadata("design:paramtypes", [messaging_service_1.MessagingService])
], MessagingController);
//# sourceMappingURL=messaging.controller.js.map