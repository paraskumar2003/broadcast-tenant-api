import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import { IQueueConsumer } from './consumer.interface';
import { QUEUE_NAMES } from '../queue.interface';

interface HandlerEntry {
  queueName: string;
  queueUrl: string;
  handler: (data: any) => Promise<void>;
  concurrency: number;
}

@Injectable()
export class SqsConsumerService
  implements IQueueConsumer, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(SqsConsumerService.name);
  private readonly client: SQSClient;
  private readonly handlers: HandlerEntry[] = [];
  private readonly queueUrls: Record<string, string>;
  private running = false;
  private pollingPromises: Promise<void>[] = [];

  constructor(private readonly configService: ConfigService) {
    this.client = new SQSClient({
      region: this.configService.get<string>('aws.region'),
      credentials: {
        accessKeyId: this.configService.get<string>('aws.accessKeyId')!,
        secretAccessKey: this.configService.get<string>('aws.secretAccessKey')!,
      },
    });

    this.queueUrls = {
      [QUEUE_NAMES.MESSAGE_SEND]: this.configService.get<string>(
        'aws.sqs.messageQueueUrl',
      )!,
      [QUEUE_NAMES.WEBHOOK_PROCESS]: this.configService.get<string>(
        'aws.sqs.webhookQueueUrl',
      )!,
    };
  }

  registerHandler(
    queueName: string,
    handler: (data: any) => Promise<void>,
    concurrency = 1,
  ): void {
    const queueUrl = this.queueUrls[queueName];
    if (!queueUrl) {
      this.logger.warn(
        `No SQS URL for queue "${queueName}", skipping handler registration`,
      );
      return;
    }
    this.handlers.push({ queueName, queueUrl, handler, concurrency });
    this.logger.log(
      `Registered SQS handler for ${queueName} (concurrency: ${concurrency})`,
    );
  }

  async onModuleInit() {
    await this.start();
  }

  async start(): Promise<void> {
    if (this.running) return;
    this.running = true;

    for (const entry of this.handlers) {
      for (let i = 0; i < entry.concurrency; i++) {
        this.pollingPromises.push(this.poll(entry));
      }
    }

    return await Promise.allSettled(this.pollingPromises).then(() => {
      this.logger.log('SQS consumers started');
    });
  }

  async stop(): Promise<void> {
    this.running = false;
    await Promise.allSettled(this.pollingPromises);
    this.logger.log('SQS consumers stopped');
  }

  async onModuleDestroy() {
    await this.stop();
  }

  private async poll(entry: HandlerEntry): Promise<void> {
    while (this.running) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: entry.queueUrl,
          MaxNumberOfMessages: 10,
          WaitTimeSeconds: 20, // Long polling
          VisibilityTimeout: 30,
        });

        const response = await this.client.send(command);

        if (response.Messages && response.Messages.length > 0) {
          const promises = response.Messages.map(async (msg) => {
            try {
              const data = JSON.parse(msg.Body || '{}');
              await entry.handler(data);

              // Delete message after successful processing
              await this.client.send(
                new DeleteMessageCommand({
                  QueueUrl: entry.queueUrl,
                  ReceiptHandle: msg.ReceiptHandle,
                }),
              );
            } catch (error) {
              this.logger.error(
                `Error processing SQS message from ${entry.queueName}: ${(error as Error).message}`,
              );
              // Message will become visible again after VisibilityTimeout
            }
          });

          await Promise.allSettled(promises);
        }
      } catch (error) {
        if (this.running) {
          this.logger.error(
            `SQS polling error for ${entry.queueName}: ${(error as Error).message}`,
          );
          await this.sleep(5000); // Back off on error
        }
      }
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
