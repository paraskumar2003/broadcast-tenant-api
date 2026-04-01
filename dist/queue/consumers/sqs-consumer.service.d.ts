import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IQueueConsumer } from './consumer.interface';
export declare class SqsConsumerService implements IQueueConsumer, OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly handlers;
    private readonly queueUrls;
    private running;
    private pollingPromises;
    constructor(configService: ConfigService);
    registerHandler(queueName: string, handler: (data: any) => Promise<void>, concurrency?: number): void;
    onModuleInit(): Promise<void>;
    start(): Promise<void>;
    stop(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private poll;
    private sleep;
}
