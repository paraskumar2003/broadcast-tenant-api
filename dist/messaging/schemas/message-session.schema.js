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
exports.MessageSessionSchema = exports.MessageSession = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let MessageSession = class MessageSession {
    projectConfigId;
    templateName;
    templatePayload;
    language;
    totalRecipients;
    counters;
    status;
    scheduledAt;
    completedAt;
};
exports.MessageSession = MessageSession;
__decorate([
    (0, mongoose_1.Prop)({
        type: mongoose_2.Types.ObjectId,
        ref: 'ProjectConfiguration',
        required: true,
        index: true,
    }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], MessageSession.prototype, "projectConfigId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], MessageSession.prototype, "templateName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], MessageSession.prototype, "templatePayload", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'en_US' }),
    __metadata("design:type", String)
], MessageSession.prototype, "language", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], MessageSession.prototype, "totalRecipients", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            queued: { type: Number, default: 0 },
            sent: { type: Number, default: 0 },
            delivered: { type: Number, default: 0 },
            read: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
        },
        default: { queued: 0, sent: 0, delivered: 0, read: 0, failed: 0 },
    }),
    __metadata("design:type", Object)
], MessageSession.prototype, "counters", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending',
        index: true,
    }),
    __metadata("design:type", String)
], MessageSession.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], MessageSession.prototype, "scheduledAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Date, default: null }),
    __metadata("design:type", Object)
], MessageSession.prototype, "completedAt", void 0);
exports.MessageSession = MessageSession = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'message_sessions' })
], MessageSession);
exports.MessageSessionSchema = mongoose_1.SchemaFactory.createForClass(MessageSession);
exports.MessageSessionSchema.index({ projectConfigId: 1, status: 1 });
exports.MessageSessionSchema.index({ createdAt: -1 });
//# sourceMappingURL=message-session.schema.js.map