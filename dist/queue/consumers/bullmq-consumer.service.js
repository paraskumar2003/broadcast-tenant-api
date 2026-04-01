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
var BullmqConsumerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullmqConsumerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
let BullmqConsumerService = BullmqConsumerService_1 = class BullmqConsumerService {
    configService;
    logger = new common_1.Logger(BullmqConsumerService_1.name);
    workers = [];
    connection;
    constructor(configService) {
        this.configService = configService;
        this.connection = {
            host: this.configService.get('redis.host') || '127.0.0.1',
            port: this.configService.get('redis.port') || 6379,
        };
    }
    registerHandler(queueName, handler, concurrency = 1) {
        const worker = new bullmq_1.Worker(queueName, async (job) => {
            await handler(job.data);
        }, {
            connection: this.connection,
            concurrency,
            prefix: '{BULLMQ}',
        });
        worker.on('completed', (job) => {
            this.logger.debug(`BullMQ job ${job.id} completed on ${queueName}`);
        });
        worker.on('failed', (job, err) => {
            this.logger.error(`BullMQ job ${job?.id} failed on ${queueName}: ${err.message}`);
        });
        this.workers.push(worker);
        this.logger.log(`Registered BullMQ worker for ${queueName} (concurrency: ${concurrency})`);
    }
    async start() {
        return Promise.resolve().then(() => {
            this.logger.log('BullMQ consumers active');
        });
    }
    async stop() {
        for (const worker of this.workers) {
            await worker.close();
        }
        this.logger.log('BullMQ consumers stopped');
    }
    async onModuleDestroy() {
        await this.stop();
    }
};
exports.BullmqConsumerService = BullmqConsumerService;
exports.BullmqConsumerService = BullmqConsumerService = BullmqConsumerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], BullmqConsumerService);
//# sourceMappingURL=bullmq-consumer.service.js.map