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
var SqsConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqsConsumerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_sqs_1 = require("@aws-sdk/client-sqs");
const queue_interface_1 = require("../queue.interface");
let SqsConsumerService = SqsConsumerService_1 = class SqsConsumerService {
    configService;
    logger = new common_1.Logger(SqsConsumerService_1.name);
    client;
    handlers = [];
    queueUrls;
    running = false;
    pollingPromises = [];
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
    registerHandler(queueName, handler, concurrency = 1) {
        const queueUrl = this.queueUrls[queueName];
        if (!queueUrl) {
            this.logger.warn(`No SQS URL for queue "${queueName}", skipping handler registration`);
            return;
        }
        this.handlers.push({ queueName, queueUrl, handler, concurrency });
        this.logger.log(`Registered SQS handler for ${queueName} (concurrency: ${concurrency})`);
    }
    async onModuleInit() {
        await this.start();
    }
    async start() {
        if (this.running)
            return;
        this.running = true;
        for (const entry of this.handlers) {
            for (let i = 0; i < entry.concurrency; i++) {
                this.pollingPromises.push(this.poll(entry));
            }
        }
        return await Promise.allSettled(this.pollingPromises).then(() => {
            this.logger.log('SQS consumers started');
        });
    }
    async stop() {
        this.running = false;
        await Promise.allSettled(this.pollingPromises);
        this.logger.log('SQS consumers stopped');
    }
    async onModuleDestroy() {
        await this.stop();
    }
    async poll(entry) {
        while (this.running) {
            try {
                const command = new client_sqs_1.ReceiveMessageCommand({
                    QueueUrl: entry.queueUrl,
                    MaxNumberOfMessages: 10,
                    WaitTimeSeconds: 20,
                    VisibilityTimeout: 30,
                });
                const response = await this.client.send(command);
                if (response.Messages && response.Messages.length > 0) {
                    const promises = response.Messages.map(async (msg) => {
                        try {
                            const data = JSON.parse(msg.Body || '{}');
                            await entry.handler(data);
                            await this.client.send(new client_sqs_1.DeleteMessageCommand({
                                QueueUrl: entry.queueUrl,
                                ReceiptHandle: msg.ReceiptHandle,
                            }));
                        }
                        catch (error) {
                            this.logger.error(`Error processing SQS message from ${entry.queueName}: ${error.message}`);
                        }
                    });
                    await Promise.allSettled(promises);
                }
            }
            catch (error) {
                if (this.running) {
                    this.logger.error(`SQS polling error for ${entry.queueName}: ${error.message}`);
                    await this.sleep(5000);
                }
            }
        }
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
};
exports.SqsConsumerService = SqsConsumerService;
exports.SqsConsumerService = SqsConsumerService = SqsConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SqsConsumerService);
//# sourceMappingURL=sqs-consumer.service.js.map