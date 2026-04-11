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
var ConversationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const conversation_schema_1 = require("./schemas/conversation.schema");
const message_schema_1 = require("../messaging/schemas/message.schema");
const CONVERSATION_WINDOW_MS = 24 * 60 * 60 * 1000;
let ConversationService = ConversationService_1 = class ConversationService {
    conversationModel;
    messageModel;
    logger = new common_1.Logger(ConversationService_1.name);
    constructor(conversationModel, messageModel) {
        this.conversationModel = conversationModel;
        this.messageModel = messageModel;
    }
    async findOrCreateConversation(projectId, contactId, mobile) {
        const now = new Date();
        const existing = await this.conversationModel.findOne({
            projectId,
            contactId,
            status: 'open',
            conversationWindowExpiresAt: { $gt: now },
        });
        if (existing)
            return existing;
        await this.conversationModel.updateMany({ projectId, contactId, status: 'open' }, { $set: { status: 'closed' } });
        const conversation = await this.conversationModel.create({
            projectId,
            contactId,
            mobile,
            status: 'open',
            conversationWindowExpiresAt: new Date(now.getTime() + CONVERSATION_WINDOW_MS),
        });
        this.logger.debug(`New conversation created for contact ${contactId} in project ${projectId}`);
        return conversation;
    }
    async updateLastMessage(conversationId, messageId, text, timestamp) {
        await this.conversationModel.updateOne({ _id: conversationId }, {
            $set: {
                lastMessageId: messageId,
                lastMessageAt: timestamp,
                lastMessageText: text || '',
                conversationWindowExpiresAt: new Date(timestamp.getTime() + CONVERSATION_WINDOW_MS),
            },
        });
    }
    async closeExpiredConversations() {
        const result = await this.conversationModel.updateMany({
            status: 'open',
            conversationWindowExpiresAt: { $lte: new Date() },
        }, { $set: { status: 'closed' } });
        return result.modifiedCount;
    }
    async listConversations(projectId, page = 1, limit = 20, status) {
        const projId = new mongoose_2.Types.ObjectId(projectId);
        const skip = (page - 1) * limit;
        const filter = { projectId: projId };
        if (status)
            filter.status = status;
        const [conversations, total] = await Promise.all([
            this.conversationModel
                .find(filter)
                .sort({ lastMessageAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('contactId', 'name mobile'),
            this.conversationModel.countDocuments(filter),
        ]);
        return {
            data: conversations,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getConversation(id) {
        const conversation = await this.conversationModel
            .findById(id)
            .populate('contactId', 'name mobile metadata');
        if (!conversation)
            throw new common_1.NotFoundException('Conversation not found');
        return conversation;
    }
    async getMessages(conversationId, page = 1, limit = 50) {
        const convId = new mongoose_2.Types.ObjectId(conversationId);
        const skip = (page - 1) * limit;
        const exists = await this.conversationModel.exists({ _id: convId });
        if (!exists)
            throw new common_1.NotFoundException('Conversation not found');
        const [messages, total] = await Promise.all([
            this.messageModel
                .find({ conversationId: convId })
                .sort({ createdAt: 1 })
                .skip(skip)
                .limit(limit),
            this.messageModel.countDocuments({ conversationId: convId }),
        ]);
        return {
            data: messages,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
};
exports.ConversationService = ConversationService;
exports.ConversationService = ConversationService = ConversationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(conversation_schema_1.Conversation.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ConversationService);
//# sourceMappingURL=conversation.service.js.map