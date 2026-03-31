export interface IQueueConsumer {
  /**
   * Called when registering consumers for specific queues.
   * The consumer implementation handles how messages are received
   * (polling for SQS, processor for BullMQ).
   */
  registerHandler(
    queueName: string,
    handler: (data: any) => Promise<void>,
    concurrency?: number,
  ): void;

  /**
   * Start consuming messages. Called once during module initialization.
   */
  start(): Promise<void>;

  /**
   * Gracefully stop consuming. Called during application shutdown.
   */
  stop(): Promise<void>;
}

export const QUEUE_CONSUMER = 'QUEUE_CONSUMER';
