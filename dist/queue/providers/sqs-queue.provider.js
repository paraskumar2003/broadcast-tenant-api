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
var SqsQueueProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsQueueProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const queue_interface_1 = require("../queue.interface");
let SqsQueueProvider = SqsQueueProvider_1 = class SqsQueueProvider {
    configService;
    logger = new common_1.Logger(SqsQueueProvider_1.name);
    client;
    queueUrls;
    constructor(configService) {
        this.configService = configService;
        this.client = new client_sqs_1.SQSClient({
            region: this.configService.get('aws.region'),
            credentials: {
                accessKeyId: this.configService.get('aws.accessKeyId'),
                secretAccessKey: this.configService.get('aws.secretAccessKey'),
            },
        });
        this.queueUrls = {
            [queue_interface_1.QUEUE_NAMES.MESSAGE_SEND]: this.configService.get('aws.sqs.messageQueueUrl'),
            [queue_interface_1.QUEUE_NAMES.WEBHOOK_PROCESS]: this.configService.get('aws.sqs.webhookQueueUrl'),
        };
    }
    async publish(queueName, data, options) {
        const queueUrl = this.getQueueUrl(queueName);
        const messageId = this.generateId();
        const command = new client_sqs_1.SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: JSON.stringify(data),
            MessageGroupId: options?.groupId || 'default',
            MessageDeduplicationId: messageId,
            ...(options?.delayMs ? { DelaySeconds: Math.min(Math.floor(options.delayMs / 1000), 900) } : {}),
        });
        try {
            const result = await this.client.send(command);
            this.logger.debug(`Published to ${queueName}: ${result.MessageId}`);
            return result.MessageId || messageId;
        }
        catch (error) {
            this.logger.error(`Failed to publish to ${queueName}`, error);
            throw error;
        }
    }
    async publishBulk(queueName, items) {
        const queueUrl = this.getQueueUrl(queueName);
        const messageIds = [];
        const batches = this.chunkArray(items, 10);
        for (const batch of batches) {
            const entries = batch.map((item, idx) => {
                const id = this.generateId();
                return {
                    Id: `msg-${idx}`,
                    MessageBody: JSON.stringify(item.data),
                    MessageGroupId: item.options?.groupId || 'default',
                    MessageDeduplicationId: id,
                    ...(item.options?.delayMs
                        ? { DelaySeconds: Math.min(Math.floor(item.options.delayMs / 1000), 900) }
                        : {}),
                };
            });
            const command = new client_sqs_1.SendMessageBatchCommand({
                QueueUrl: queueUrl,
                Entries: entries,
            });
            try {
                const result = await this.client.send(command);
                const ids = result.Successful?.map((r) => r.MessageId || '') || [];
                messageIds.push(...ids);
                if (result.Failed && result.Failed.length > 0) {
                    this.logger.warn(`${result.Failed.length} messages failed in batch to ${queueName}`);
                }
            }
            catch (error) {
                this.logger.error(`Batch publish failed for ${queueName}`, error);
                throw error;
            }
        }
        return messageIds;
    }
    getQueueUrl(queueName) {
        const url = this.queueUrls[queueName];
        if (!url) {
            throw new Error(`No SQS queue URL configured for queue: ${queueName}`);
        }
        return url;
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    }
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};
exports.SqsQueueProvider = SqsQueueProvider;
exports.SqsQueueProvider = SqsQueueProvider = SqsQueueProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SqsQueueProvider);
//# sourceMappingURL=sqs-queue.provider.js.map