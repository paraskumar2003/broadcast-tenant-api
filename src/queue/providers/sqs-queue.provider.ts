import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  SendMessageCommand,
  SendMessageBatchCommand,
  SendMessageBatchRequestEntry,
} from '@aws-sdk/client-sqs';
import type { IQueueService, QueueJobOptions, QueueJobData } from '../queue.interface';
import { QUEUE_NAMES } from '../queue.interface';

@Injectable()
export class SqsQueueProvider implements IQueueService {
  private readonly logger = new Logger(SqsQueueProvider.name);
  private readonly client: SQSClient;
  private readonly queueUrls: Record<string, string>;

  constructor(private readonly configService: ConfigService) {
    this.client = new SQSClient({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId')!,
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey')!,
      },
    });

    this.queueUrls = {
      [QUEUE_NAMES.MESSAGE_SEND]: this.configService.get<string>('aws.sqs.messageQueueUrl')!,
      [QUEUE_NAMES.WEBHOOK_PROCESS]: this.configService.get<string>('aws.sqs.webhookQueueUrl')!,
    };
  }

  async publish<T = any>(queueName: string, data: T, options?: QueueJobOptions): Promise<string> {
    const queueUrl = this.getQueueUrl(queueName);
    const messageId = this.generateId();

    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(data),
      MessageGroupId: options?.groupId || 'default',
      MessageDeduplicationId: messageId,
      ...(options?.delayMs ? { DelaySeconds: Math.min(Math.floor(options.delayMs / 1000), 900) } : {}),
    });

    try {
      const result = await this.client.send(command);
      this.logger.debug(`Published to ${queueName}: ${result.MessageId}`);
      return result.MessageId || messageId;
    } catch (error) {
      this.logger.error(`Failed to publish to ${queueName}`, error);
      throw error;
    }
  }

  async publishBulk<T = any>(queueName: string, items: QueueJobData<T>[]): Promise<string[]> {
    const queueUrl = this.getQueueUrl(queueName);
    const messageIds: string[] = [];

    // SQS SendMessageBatch supports max 10 messages per call
    const batches = this.chunkArray(items, 10);

    for (const batch of batches) {
      const entries: SendMessageBatchRequestEntry[] = batch.map((item, idx) => {
        const id = this.generateId();
        return {
          Id: `msg-${idx}`,
          MessageBody: JSON.stringify(item.data),
          MessageGroupId: item.options?.groupId || 'default',
          MessageDeduplicationId: id,
          ...(item.options?.delayMs
            ? { DelaySeconds: Math.min(Math.floor(item.options.delayMs / 1000), 900) }
            : {}),
        };
      });

      const command = new SendMessageBatchCommand({
        QueueUrl: queueUrl,
        Entries: entries,
      });

      try {
        const result = await this.client.send(command);
        const ids = result.Successful?.map((r) => r.MessageId || '') || [];
        messageIds.push(...ids);

        if (result.Failed && result.Failed.length > 0) {
          this.logger.warn(`${result.Failed.length} messages failed in batch to ${queueName}`);
        }
      } catch (error) {
        this.logger.error(`Batch publish failed for ${queueName}`, error);
        throw error;
      }
    }

    return messageIds;
  }

  private getQueueUrl(queueName: string): string {
    const url = this.queueUrls[queueName];
    if (!url) {
      throw new Error(`No SQS queue URL configured for queue: ${queueName}`);
    }
    return url;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
