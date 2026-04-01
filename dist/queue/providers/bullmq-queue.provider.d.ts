import { ConfigService } from '@nestjs/config';
import type { IQueueService, QueueJobOptions, QueueJobData } from '../queue.interface';
export declare class BullmqQueueProvider implements IQueueService {
    private readonly configService;
    private readonly logger;
    private readonly queues;
    constructor(configService: ConfigService);
    publish<T = any>(queueName: string, data: T, options?: QueueJobOptions): Promise<string>;
    publishBulk<T = any>(queueName: string, items: QueueJobData<T>[]): Promise<string[]>;
    private getQueue;
    onModuleDestroy(): Promise<void>;
}
