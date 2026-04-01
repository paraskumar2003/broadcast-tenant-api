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
var BullmqQueueProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullmqQueueProvider = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
const queue_interface_1 = require("../queue.interface");
let BullmqQueueProvider = BullmqQueueProvider_1 = class BullmqQueueProvider {
    configService;
    logger = new common_1.Logger(BullmqQueueProvider_1.name);
    queues = new Map();
    constructor(configService) {
        this.configService = configService;
        const connection = {
            host: this.configService.get('redis.host'),
            port: this.configService.get('redis.port'),
        };
        Object.values(queue_interface_1.QUEUE_NAMES).forEach((name) => {
            this.queues.set(name, new bullmq_1.Queue(name, {
                connection,
                prefix: '{BULLMQ}',
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'fixed', delay: 5000 },
                    removeOnComplete: 1000,
                    removeOnFail: 5000,
                },
            }));
        });
    }
    async publish(queueName, data, options) {
        const queue = this.getQueue(queueName);
        const job = await queue.add(queueName, data, {
            ...(options?.delayMs ? { delay: options.delayMs } : {}),
            ...(options?.attempts ? { attempts: options.attempts } : {}),
            ...(options?.backoffMs ? { backoff: { type: 'fixed', delay: options.backoffMs } } : {}),
        });
        this.logger.debug(`Published to ${queueName}: ${job.id}`);
        return job.id || '';
    }
    async publishBulk(queueName, items) {
        const queue = this.getQueue(queueName);
        const jobs = items.map((item) => ({
            name: queueName,
            data: item.data,
            opts: {
                ...(item.options?.delayMs ? { delay: item.options.delayMs } : {}),
                ...(item.options?.attempts ? { attempts: item.options.attempts } : {}),
            },
        }));
        const results = await queue.addBulk(jobs);
        return results.map((j) => j.id || '');
    }
    getQueue(queueName) {
        const queue = this.queues.get(queueName);
        if (!queue) {
            throw new Error(`No BullMQ queue found for: ${queueName}`);
        }
        return queue;
    }
    async onModuleDestroy() {
        for (const queue of this.queues.values()) {
            await queue.close();
        }
    }
};
exports.BullmqQueueProvider = BullmqQueueProvider;
exports.BullmqQueueProvider = BullmqQueueProvider = BullmqQueueProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BullmqQueueProvider);
//# sourceMappingURL=bullmq-queue.provider.js.map