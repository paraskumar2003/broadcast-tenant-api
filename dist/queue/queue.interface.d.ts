export declare const QUEUE_SERVICE = "QUEUE_SERVICE";
export declare const QUEUE_NAMES: {
    readonly MESSAGE_SEND: "whatsapp-message-send";
    readonly WEBHOOK_PROCESS: "whatsapp-webhook-process";
};
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
    publish<T = any>(queueName: string, data: T, options?: QueueJobOptions): Promise<string>;
    publishBulk<T = any>(queueName: string, items: QueueJobData<T>[]): Promise<string[]>;
}
