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
var WebhookConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookConsumer = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const delivery_status_schema_1 = require("./schemas/delivery-status.schema");
const message_schema_1 = require("../messaging/schemas/message.schema");
const message_session_schema_1 = require("../messaging/schemas/message-session.schema");
const consumer_interface_1 = require("../queue/consumers/consumer.interface");
const queue_interface_1 = require("../queue/queue.interface");
let WebhookConsumer = WebhookConsumer_1 = class WebhookConsumer {
    deliveryStatusModel;
    messageModel;
    sessionModel;
    consumer;
    logger = new common_1.Logger(WebhookConsumer_1.name);
    constructor(deliveryStatusModel, messageModel, sessionModel, consumer) {
        this.deliveryStatusModel = deliveryStatusModel;
        this.messageModel = messageModel;
        this.sessionModel = sessionModel;
        this.consumer = consumer;
    }
    async onModuleInit() {
        this.consumer.registerHandler(queue_interface_1.QUEUE_NAMES.WEBHOOK_PROCESS, this.processWebhook.bind(this), 5);
    }
    async processWebhook(data) {
        try {
            if (data.object !== 'whatsapp_business_account' ||
                !data.entry?.[0]?.changes?.length) {
                return;
            }
            const entry = data.entry[0];
            const wabaId = entry.id;
            const change = entry.changes[0];
            if (change.field !== 'messages')
                return;
            const value = change.value;
            const statuses = value?.statuses;
            if (statuses && statuses.length > 0) {
                for (const status of statuses) {
                    await this.processStatus(wabaId, status, data);
                }
            }
        }
        catch (error) {
            this.logger.error(`Webhook processing error: ${error.message}`, error.stack);
            throw error;
        }
    }
    async processStatus(wabaId, status, rawPayload) {
        const metaMessageId = status.id;
        const recipientNumber = status.recipient_id;
        const statusValue = status.status;
        const timestamp = new Date(parseInt(status.timestamp) * 1000);
        const errorCode = status.errors?.[0]?.code || null;
        const errorTitle = status.errors?.[0]?.title || null;
        await this.deliveryStatusModel.create({
            wabaId,
            metaMessageId,
            recipientNumber,
            status: statusValue,
            errorCode,
            errorTitle,
            timestamp,
            rawPayload,
        });
        const message = await this.messageModel.findOne({ metaMessageId });
        if (message) {
            const statusOrder = ['queued', 'sent', 'delivered', 'read', 'failed'];
            const currentIdx = statusOrder.indexOf(message.currentStatus);
            const newIdx = statusOrder.indexOf(statusValue);
            const shouldUpdateCurrent = statusValue === 'failed' || newIdx > currentIdx;
            await this.messageModel.updateOne({ _id: message._id }, {
                ...(shouldUpdateCurrent ? { currentStatus: statusValue } : {}),
                ...(statusValue === 'failed'
                    ? { errorDetails: { code: errorCode, title: errorTitle } }
                    : {}),
                $push: {
                    statusHistory: {
                        status: statusValue,
                        timestamp,
                        raw: { errorCode, errorTitle },
                    },
                },
            });
            if (message.sessionId) {
                const counterField = `counters.${statusValue}`;
                await this.sessionModel.updateOne({ _id: message.sessionId }, { $inc: { [counterField]: 1 } });
            }
            this.logger.debug(`Status update: ${recipientNumber} -> ${statusValue} (msgId: ${metaMessageId})`);
        }
        else {
            this.logger.debug(`Status update for unknown message: ${metaMessageId} -> ${statusValue}`);
        }
    }
};
exports.WebhookConsumer = WebhookConsumer;
exports.WebhookConsumer = WebhookConsumer = WebhookConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(delivery_status_schema_1.DeliveryStatus.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(2, (0, mongoose_1.InjectModel)(message_session_schema_1.MessageSession.name)),
    __param(3, (0, common_1.Inject)(consumer_interface_1.QUEUE_CONSUMER)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model, Object])
], WebhookConsumer);
//# sourceMappingURL=webhook.consumer.js.map