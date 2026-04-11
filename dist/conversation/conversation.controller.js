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
exports.ConversationController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const swagger_2 = require("@nestjs/swagger");
const conversation_service_1 = require("./conversation.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const api_response_dto_1 = require("../common/dto/api-response.dto");
class ReplyDto {
    messageType;
    text;
    mediaUrl;
    fileName;
}
__decorate([
    (0, swagger_2.ApiProperty)({
        enum: ['text', 'image', 'video', 'audio', 'document'],
        example: 'text',
        description: 'Type of message to send',
    }),
    (0, class_validator_1.IsIn)(['text', 'image', 'video', 'audio', 'document']),
    __metadata("design:type", String)
], ReplyDto.prototype, "messageType", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        example: 'Your order has been shipped!',
        description: 'Text body (required for text messages, optional caption for media)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReplyDto.prototype, "text", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        example: 'https://example.com/image.jpg',
        description: 'Media URL (required for image/video/audio/document)',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReplyDto.prototype, "mediaUrl", void 0);
__decorate([
    (0, swagger_2.ApiPropertyOptional)({
        example: 'invoice.pdf',
        description: 'Filename used when sending document messages',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ReplyDto.prototype, "fileName", void 0);
let ConversationController = class ConversationController {
    conversationService;
    constructor(conversationService) {
        this.conversationService = conversationService;
    }
    async listConversations(projectId, status, page, limit) {
        const data = await this.conversationService.listConversations(projectId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, status);
        return api_response_dto_1.ApiResponseDto.success('Conversations fetched', data);
    }
    async reply(id, dto) {
        const data = await this.conversationService.sendReply(id, {
            messageType: dto.messageType,
            text: dto.text,
            mediaUrl: dto.mediaUrl,
            fileName: dto.fileName,
        });
        return api_response_dto_1.ApiResponseDto.success('Reply queued', data);
    }
    async getMessages(id, page, limit) {
        const data = await this.conversationService.getMessages(id, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 50);
        return api_response_dto_1.ApiResponseDto.success('Messages fetched', data);
    }
    async getConversation(id) {
        const data = await this.conversationService.getConversation(id);
        return api_response_dto_1.ApiResponseDto.success('Conversation fetched', data);
    }
};
exports.ConversationController = ConversationController;
__decorate([
    (0, common_1.Get)('project/:projectId'),
    (0, swagger_1.ApiOperation)({
        summary: 'List conversations for a project (paginated, for chat UI)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'status', required: false, enum: ['open', 'closed'] }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('projectId')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "listConversations", null);
__decorate([
    (0, common_1.Post)(':id/reply'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({
        summary: 'Send a free-form reply within an active conversation window (text or media)',
    }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReplyDto]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "reply", null);
__decorate([
    (0, common_1.Get)(':id/messages'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get paginated messages for a conversation (sorted descending)',
    }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getMessages", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a single conversation with contact details' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ConversationController.prototype, "getConversation", null);
exports.ConversationController = ConversationController = __decorate([
    (0, swagger_1.ApiTags)('Conversations'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('conversations'),
    __metadata("design:paramtypes", [conversation_service_1.ConversationService])
], ConversationController);
//# sourceMappingURL=conversation.controller.js.map