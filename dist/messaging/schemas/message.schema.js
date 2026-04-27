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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageSchema = exports.Message = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Message = class Message {
    sessionId;
    broadcastId;
    projectConfigId;
    recipientNumber;
    metaMessageId;
    templateName;
    language;
    currentStatus;
    statusHistory;
    errorDetails;
    conversationId;
    contactId;
    direction;
    messageType;
    text;
    mediaUrl;
};
exports.Message = Message;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'MessageSession',
        index: true,
        default: null,
    }),
    __metadata("design:type", Object)
], Message.prototype, "sessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Broadcast',
        index: true,
        default: null,
    }),
    __metadata("design:type", Object)
], Message.prototype, "broadcastId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'ProjectConfiguration',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Message.prototype, "projectConfigId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], Message.prototype, "recipientNumber", void 0);
__decorate([
    (0, mongoose_1.Prop)({ index: true, sparse: true, unique: true }),
    __metadata("design:type", String)
], Message.prototype, "metaMessageId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Message.prototype, "templateName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: 'en_US' }),
    __metadata("design:type", String)
], Message.prototype, "language", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['queued', 'sent', 'delivered', 'read', 'failed', 'received'],
        default: 'queued',
        index: true,
    }),
    __metadata("design:type", String)
], Message.prototype, "currentStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [
            {
                status: { type: String, required: true },
                timestamp: { type: Date, required: true },
                raw: { type: Object },
            },
        ],
        default: [],
    }),
    __metadata("design:type", Array)
], Message.prototype, "statusHistory", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: null }),
    __metadata("design:type", Object)
], Message.prototype, "errorDetails", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Conversation',
        index: true,
        default: null,
    }),
    __metadata("design:type", Object)
], Message.prototype, "conversationId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'Contact',
        index: true,
        default: null,
    }),
    __metadata("design:type", Object)
], Message.prototype, "contactId", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['inbound', 'outbound'],
        default: 'outbound',
    }),
    __metadata("design:type", String)
], Message.prototype, "direction", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['text', 'image', 'document', 'template', 'audio', 'video', 'sticker', 'location', 'contacts', 'reaction', 'unknown'],
        default: 'template',
    }),
    __metadata("design:type", String)
], Message.prototype, "messageType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Message.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, default: null }),
    __metadata("design:type", Object)
], Message.prototype, "mediaUrl", void 0);
exports.Message = Message = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'messages' })
], Message);
exports.MessageSchema = mongoose_1.SchemaFactory.createForClass(Message);
exports.MessageSchema.index({ sessionId: 1, currentStatus: 1 });
exports.MessageSchema.index({ metaMessageId: 1 }, { unique: true, sparse: true });
exports.MessageSchema.index({ conversationId: 1, createdAt: 1 });
exports.MessageSchema.index({ createdAt: -1 });
exports.MessageSchema.index({ projectConfigId: 1, createdAt: -1 });
exports.MessageSchema.index({ projectConfigId: 1, currentStatus: 1, createdAt: -1 });
exports.MessageSchema.index({ projectConfigId: 1, broadcastId: 1, createdAt: -1 });
exports.MessageSchema.index({ projectConfigId: 1, recipientNumber: 1, createdAt: -1 });
exports.MessageSchema.index({ projectConfigId: 1, templateName: 1, createdAt: -1 });
//# sourceMappingURL=message.schema.js.map