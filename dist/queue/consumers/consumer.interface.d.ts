export interface IQueueConsumer {
    registerHandler(queueName: string, handler: (data: any) => Promise<void>, concurrency?: number): void;
    start(): Promise<void>;
    stop(): Promise<void>;
}
export declare const QUEUE_CONSUMER = "QUEUE_CONSUMER";
