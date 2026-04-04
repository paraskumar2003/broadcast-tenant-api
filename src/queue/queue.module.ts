import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { QUEUE_SERVICE } from './queue.interface';
import { QUEUE_CONSUMER } from './consumers/consumer.interface';
import { SqsQueueProvider } from './providers/sqs-queue.provider';
import { BullmqQueueProvider } from './providers/bullmq-queue.provider';
import { SqsConsumerService } from './consumers/sqs-consumer.service';
import { BullmqConsumerService } from './consumers/bullmq-consumer.service';

@Global()
@Module({
  providers: [
    {
      provide: QUEUE_SERVICE,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('queue.provider');
        if (provider === 'bullmq') {
          return new BullmqQueueProvider(configService);
        }
        return new SqsQueueProvider(configService);
      },
      inject: [ConfigService],
    },
    {
      provide: QUEUE_CONSUMER,
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('queue.provider');
        if (provider === 'bullmq') {
          return new BullmqConsumerService(configService);
        }
        return new SqsConsumerService(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [QUEUE_SERVICE, QUEUE_CONSUMER],
})
export class QueueModule { }
