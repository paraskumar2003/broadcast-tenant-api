import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import type { IQueueService, QueueJobOptions, QueueJobData } from '../queue.interface';
import { QUEUE_NAMES } from '../queue.interface';

@Injectable()
export class BullmqQueueProvider implements IQueueService {
  private readonly logger = new Logger(BullmqQueueProvider.name);
  private readonly queues: Map<string, Queue> = new Map();

  constructor(private readonly configService: ConfigService) {
    const connection = {
      host: this.configService.get<string>('redis.host'),
      port: this.configService.get<number>('redis.port'),
    };

    // Initialize queues
    Object.values(QUEUE_NAMES).forEach((name) => {
      this.queues.set(
        name,
        new Queue(name, {
          connection,
          prefix: '{BULLMQ}',
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'fixed', delay: 5000 },
            removeOnComplete: 1000,
            removeOnFail: 5000,
          },
        }),
      );
    });
  }

  async publish<T = any>(queueName: string, data: T, options?: QueueJobOptions): Promise<string> {
    const queue = this.getQueue(queueName);

    const job = await queue.add(queueName, data, {
      ...(options?.delayMs ? { delay: options.delayMs } : {}),
      ...(options?.attempts ? { attempts: options.attempts } : {}),
      ...(options?.backoffMs ? { backoff: { type: 'fixed', delay: options.backoffMs } } : {}),
    });

    this.logger.debug(`Published to ${queueName}: ${job.id}`);
    return job.id || '';
  }

  async publishBulk<T = any>(queueName: string, items: QueueJobData<T>[]): Promise<string[]> {
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

  private getQueue(queueName: string): Queue {
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

  getQueues(): Queue[] {
    return Array.from(this.queues.values());
  }
}
