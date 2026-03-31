export const QUEUE_SERVICE = 'QUEUE_SERVICE';

export const QUEUE_NAMES = {
  MESSAGE_SEND: 'whatsapp-message-send',
  WEBHOOK_PROCESS: 'whatsapp-webhook-process',
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

export interface QueueJobOptions {
  delayMs?: number;
  attempts?: number;
  backoffMs?: number;
  groupId?: string;
}

export interface QueueJobData<T = any> {
  data: T;
  options?: QueueJobOptions;
}

export interface IQueueService {
  /**
   * Publish a single job to a named queue.
   */
  publish<T = any>(queueName: string, data: T, options?: QueueJobOptions): Promise<string>;

  /**
   * Publish multiple jobs to a named queue.
   */
  publishBulk<T = any>(queueName: string, items: QueueJobData<T>[]): Promise<string[]>;
}
