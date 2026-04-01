"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const queue_interface_1 = require("./queue.interface");
const consumer_interface_1 = require("./consumers/consumer.interface");
const sqs_queue_provider_1 = require("./providers/sqs-queue.provider");
const bullmq_queue_provider_1 = require("./providers/bullmq-queue.provider");
const sqs_consumer_service_1 = require("./consumers/sqs-consumer.service");
const bullmq_consumer_service_1 = require("./consumers/bullmq-consumer.service");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: queue_interface_1.QUEUE_SERVICE,
                useFactory: (configService) => {
                    const provider = configService.get('queue.provider');
                    if (provider === 'bullmq') {
                        return new bullmq_queue_provider_1.BullmqQueueProvider(configService);
                    }
                    return new sqs_queue_provider_1.SqsQueueProvider(configService);
                },
                inject: [config_1.ConfigService],
            },
            {
                provide: consumer_interface_1.QUEUE_CONSUMER,
                useFactory: (configService) => {
                    const provider = configService.get('queue.provider');
                    if (provider === 'bullmq') {
                        return new bullmq_consumer_service_1.BullmqConsumerService(configService);
                    }
                    return new sqs_consumer_service_1.SqsConsumerService(configService);
                },
                inject: [config_1.ConfigService],
            },
        ],
        exports: [queue_interface_1.QUEUE_SERVICE, consumer_interface_1.QUEUE_CONSUMER],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map