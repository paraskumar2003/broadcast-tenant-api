import type { IQueueService } from '../queue/queue.interface';
export declare class WebhookService {
    private readonly queueService;
    private readonly logger;
    constructor(queueService: IQueueService);
    enqueueWebhook(payload: any): Promise<void>;
}
