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
var MessagingConsumer_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingConsumer = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const message_schema_1 = require("./schemas/message.schema");
const message_session_schema_1 = require("./schemas/message-session.schema");
const broadcast_schema_1 = require("./schemas/broadcast.schema");
const meta_api_service_1 = require("../meta-api/meta-api.service");
const project_service_1 = require("../project/project.service");
const template_builder_service_1 = require("./template-builder.service");
const consumer_interface_1 = require("../queue/consumers/consumer.interface");
const queue_interface_1 = require("../queue/queue.interface");
let MessagingConsumer = MessagingConsumer_1 = class MessagingConsumer {
    messageModel;
    sessionModel;
    broadcastModel;
    consumer;
    metaApiService;
    projectService;
    templateBuilder;
    logger = new common_1.Logger(MessagingConsumer_1.name);
    constructor(messageModel, sessionModel, broadcastModel, consumer, metaApiService, projectService, templateBuilder) {
        this.messageModel = messageModel;
        this.sessionModel = sessionModel;
        this.broadcastModel = broadcastModel;
        this.consumer = consumer;
        this.metaApiService = metaApiService;
        this.projectService = projectService;
        this.templateBuilder = templateBuilder;
    }
    async onModuleInit() {
        this.consumer.registerHandler(queue_interface_1.QUEUE_NAMES.MESSAGE_SEND, this.processMessage.bind(this), 2);
        await this.consumer.start();
        this.logger.log('Messaging consumer registered');
    }
    async updateCounters(sessionId, broadcastId, inc, extra) {
        const ops = [];
        if (sessionId) {
            ops.push(this.sessionModel.updateOne({ _id: new mongoose_2.Types.ObjectId(sessionId) }, { $inc: inc, ...(extra || {}) }));
        }
        if (broadcastId) {
            ops.push(this.broadcastModel.updateOne({ _id: new mongoose_2.Types.ObjectId(broadcastId) }, { $inc: inc, ...(extra || {}) }));
        }
        await Promise.all(ops);
    }
    async processMessage(data) {
        const { messageId, sessionId, broadcastId, projectConfigId, recipientNumber, type, } = data;
        console.log(data, 'data');
        try {
            const config = await this.projectService.getConfigurationById(projectConfigId);
            if (type === 'text') {
                const response = await this.metaApiService.sendTextMessage(config.phoneNumberId, config.accessToken, recipientNumber, data.text || '');
                const metaMessageId = response.messages?.[0]?.id;
                if (messageId) {
                    await this.messageModel.updateOne({ _id: new mongoose_2.Types.ObjectId(messageId) }, {
                        metaMessageId,
                        currentStatus: 'sent',
                        $push: {
                            statusHistory: { status: 'sent', timestamp: new Date() },
                        },
                    });
                }
                await this.updateCounters(sessionId, broadcastId, {
                    'counters.sent': 1,
                });
                this.logger.log(`Text message sent to ${recipientNumber} (metaId: ${metaMessageId})`);
                return;
            }
            const mediaTypes = ['image', 'video', 'audio', 'document'];
            if (mediaTypes.includes(type)) {
                const response = await this.metaApiService.sendMediaMessage(config.phoneNumberId, config.accessToken, recipientNumber, type, data.mediaUrl || '', data.text || undefined, data.fileName);
                const metaMessageId = response.messages?.[0]?.id;
                if (messageId) {
                    await this.messageModel.updateOne({ _id: new mongoose_2.Types.ObjectId(messageId) }, {
                        metaMessageId,
                        currentStatus: 'sent',
                        $push: {
                            statusHistory: { status: 'sent', timestamp: new Date() },
                        },
                    });
                }
                await this.updateCounters(sessionId, broadcastId, {
                    'counters.sent': 1,
                });
                this.logger.log(`Media (${type}) sent to ${recipientNumber} (metaId: ${metaMessageId})`);
                return;
            }
            const components = this.templateBuilder.buildComponents(data.templateComponents, data.params);
            const response = await this.metaApiService.sendTemplateMessage(config.phoneNumberId, config.accessToken, recipientNumber, data.templateName, data.language, components);
            const metaMessageId = response.messages?.[0]?.id;
            if (messageId) {
                await this.messageModel.updateOne({ _id: new mongoose_2.Types.ObjectId(messageId) }, {
                    metaMessageId,
                    currentStatus: 'sent',
                    $push: {
                        statusHistory: { status: 'sent', timestamp: new Date() },
                    },
                });
            }
            if (sessionId) {
                const session = await this.sessionModel.findById(sessionId);
                if (session) {
                    const newSentCount = session.counters.sent + 1;
                    const isComplete = newSentCount >= session.totalRecipients;
                    await this.sessionModel.updateOne({ _id: new mongoose_2.Types.ObjectId(sessionId) }, {
                        $inc: { 'counters.sent': 1 },
                        ...(isComplete
                            ? { status: 'completed', completedAt: new Date() }
                            : {}),
                    });
                }
            }
            if (broadcastId) {
                const broadcast = await this.broadcastModel.findById(broadcastId);
                if (broadcast) {
                    const newSentCount = broadcast.counters.sent + 1;
                    const isComplete = newSentCount >= broadcast.totalRecipients;
                    await this.broadcastModel.updateOne({ _id: new mongoose_2.Types.ObjectId(broadcastId) }, {
                        $inc: { 'counters.sent': 1 },
                        ...(isComplete
                            ? { status: 'completed', completedAt: new Date() }
                            : {}),
                    });
                }
            }
            this.logger.log(`Template message sent to ${recipientNumber} (metaId: ${metaMessageId})`);
        }
        catch (error) {
            this.logger.error(`Failed to send message to ${recipientNumber}: ${error.message}`);
            if (messageId) {
                await this.messageModel.updateOne({ _id: new mongoose_2.Types.ObjectId(messageId) }, {
                    currentStatus: 'failed',
                    errorDetails: { message: error.message, stack: error.stack },
                    $push: {
                        statusHistory: {
                            status: 'failed',
                            timestamp: new Date(),
                            raw: { error: error.message },
                        },
                    },
                });
            }
            await this.updateCounters(sessionId, broadcastId, {
                'counters.failed': 1,
            });
            throw error;
        }
    }
};
exports.MessagingConsumer = MessagingConsumer;
exports.MessagingConsumer = MessagingConsumer = MessagingConsumer_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(message_schema_1.Message.name)),
    __param(1, (0, mongoose_1.InjectModel)(message_session_schema_1.MessageSession.name)),
    __param(2, (0, mongoose_1.InjectModel)(broadcast_schema_1.Broadcast.name)),
    __param(3, (0, common_1.Inject)(consumer_interface_1.QUEUE_CONSUMER)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model, Object, meta_api_service_1.MetaApiService,
        project_service_1.ProjectService,
        template_builder_service_1.TemplateBuilderService])
], MessagingConsumer);
//# sourceMappingURL=messaging.consumer.js.map