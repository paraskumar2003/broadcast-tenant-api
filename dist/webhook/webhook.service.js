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
var WebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const queue_interface_1 = require("../queue/queue.interface");
let WebhookService = WebhookService_1 = class WebhookService {
    queueService;
    logger = new common_1.Logger(WebhookService_1.name);
    constructor(queueService) {
        this.queueService = queueService;
    }
    async enqueueWebhook(payload) {
        this.logger.debug('Enqueueing webhook payload');
        await this.queueService.publish(queue_interface_1.QUEUE_NAMES.WEBHOOK_PROCESS, payload);
    }
};
exports.WebhookService = WebhookService;
exports.WebhookService = WebhookService = WebhookService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(queue_interface_1.QUEUE_SERVICE)),
    __metadata("design:paramtypes", [Object])
], WebhookService);
//# sourceMappingURL=webhook.service.js.map