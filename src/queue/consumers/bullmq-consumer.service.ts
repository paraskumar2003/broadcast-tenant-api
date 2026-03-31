import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Worker } from 'bullmq';
import { IQueueConsumer } from './consumer.interface';

@Injectable()
export class BullmqConsumerService implements IQueueConsumer, OnModuleDestroy {
  private readonly logger = new Logger(BullmqConsumerService.name);
  private readonly workers: Worker[] = [];
  private readonly connection: { host: string; port: number };

  constructor(private readonly configService: ConfigService) {
    this.connection = {
      host: this.configService.get<string>('redis.host') || '127.0.0.1',
      port: this.configService.get<number>('redis.port') || 6379,
    };
  }

  registerHandler(
    queueName: string,
    handler: (data: any) => Promise<void>,
    concurrency = 1,
  ): void {
    const worker = new Worker(
      queueName,
      async (job) => {
        await handler(job.data);
      },
      {
        connection: this.connection,
        concurrency,
        prefix: '{BULLMQ}',
      },
    );

    worker.on('completed', (job) => {
      this.logger.debug(`BullMQ job ${job.id} completed on ${queueName}`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`BullMQ job ${job?.id} failed on ${queueName}: ${err.message}`);
    });

    this.workers.push(worker);
    this.logger.log(`Registered BullMQ worker for ${queueName} (concurrency: ${concurrency})`);
  }

  async start(): Promise<void> {
    // BullMQ workers start automatically on creation
    this.logger.log('BullMQ consumers active');
  }

  async stop(): Promise<void> {
    for (const worker of this.workers) {
      await worker.close();
    }
    this.logger.log('BullMQ consumers stopped');
  }

  async onModuleDestroy() {
    await this.stop();
  }
}
