import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueueConsumer } from './consumer.interface';
export declare class BullmqConsumerService implements IQueueConsumer, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly workers;
    private readonly connection;
    constructor(configService: ConfigService);
    registerHandler(queueName: string, handler: (data: any) => Promise<void>, concurrency?: number): void;
    start(): Promise<void>;
    stop(): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
