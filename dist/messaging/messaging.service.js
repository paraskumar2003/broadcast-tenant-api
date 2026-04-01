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
var MessagingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_session_schema_1 = require("./schemas/message-session.schema");
const message_schema_1 = require("./schemas/message.schema");
const project_service_1 = require("../project/project.service");
const queue_interface_1 = require("../queue/queue.interface");
let MessagingService = MessagingService_1 = class MessagingService {
    sessionModel;
    messageModel;
    queueService;
    projectService;
    logger = new common_1.Logger(MessagingService_1.name);
    constructor(sessionModel, messageModel, queueService, projectService) {
        this.sessionModel = sessionModel;
        this.messageModel = messageModel;
        this.queueService = queueService;
        this.projectService = projectService;
    }
    async sendSingle(dto) {
        const session = await this.sessionModel.create({
            projectConfigId: new mongoose_2.Types.ObjectId(dto.projectConfigId),
            templateName: dto.template.name,
            templatePayload: dto.template,
            language: dto.language || 'en_US',
            totalRecipients: 1,
            status: 'processing',
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        });
        const message = await this.messageModel.create({
            sessionId: session._id,
            projectConfigId: new mongoose_2.Types.ObjectId(dto.projectConfigId),
            recipientNumber: dto.number,
            templateName: dto.template.name,
            language: dto.language || 'en_US',
            currentStatus: 'queued',
            statusHistory: [{ status: 'queued', timestamp: new Date() }],
        });
        await this.sessionModel.updateOne({ _id: session._id }, { $inc: { 'counters.queued': 1 } });
        const payload = {
            messageId: message._id.toString(),
            sessionId: session._id.toString(),
            projectConfigId: dto.projectConfigId,
            recipientNumber: dto.number,
            templateName: dto.template.name,
            templateComponents: dto.template.components || [],
            params: dto.params || {},
            language: dto.language || 'en_US',
            type: 'template',
        };
        const delayMs = dto.scheduledAt
            ? new Date(dto.scheduledAt).getTime() - Date.now()
            : undefined;
        await this.queueService.publish(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, payload, {
            delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
        });
        return { sessionId: session._id, messageId: message._id };
    }
    async sendBulk(dto) {
        const session = await this.sessionModel.create({
            projectConfigId: new mongoose_2.Types.ObjectId(dto.projectConfigId),
            templateName: dto.template.name,
            templatePayload: dto.template,
            language: dto.language || 'en_US',
            totalRecipients: dto.recipients.length,
            status: 'processing',
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        });
        const delayMs = dto.scheduledAt
            ? new Date(dto.scheduledAt).getTime() - Date.now()
            : undefined;
        const messages = await this.messageModel.insertMany(dto.recipients.map((r) => ({
            sessionId: session._id,
            projectConfigId: new mongoose_2.Types.ObjectId(dto.projectConfigId),
            recipientNumber: r.number,
            templateName: dto.template.name,
            language: dto.language || 'en_US',
            currentStatus: 'queued',
            statusHistory: [{ status: 'queued', timestamp: new Date() }],
        })));
        await this.sessionModel.updateOne({ _id: session._id }, { $inc: { 'counters.queued': messages.length } });
        const queueItems = messages.map((msg, idx) => ({
            data: {
                messageId: msg._id.toString(),
                sessionId: session._id.toString(),
                projectConfigId: dto.projectConfigId,
                recipientNumber: dto.recipients[idx].number,
                templateName: dto.template.name,
                templateComponents: dto.template.components || [],
                params: dto.recipients[idx].params || {},
                language: dto.language || 'en_US',
                type: 'template',
            },
            options: {
                delayMs: delayMs && delayMs > 0 ? delayMs : undefined,
            },
        }));
        await this.queueService.publishBulk(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, queueItems);
        return {
            sessionId: session._id,
            totalQueued: messages.length,
        };
    }
    async sendText(dto) {
        const payload = {
            messageId: '',
            sessionId: '',
            projectConfigId: dto.projectConfigId,
            recipientNumber: dto.number,
            templateName: '',
            templateComponents: [],
            params: {},
            language: 'en_US',
            type: 'text',
            text: dto.text,
        };
        await this.queueService.publish(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, payload);
        return { status: true, message: 'Text message queued' };
    }
};
exports.MessagingService = MessagingService;
exports.MessagingService = MessagingService = MessagingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_session_schema_1.MessageSession.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(2, (0, common_1.Inject)(queue_interface_1.QUEUE_SERVICE)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model, Object, project_service_1.ProjectService])
], MessagingService);
//# sourceMappingURL=messaging.service.js.map