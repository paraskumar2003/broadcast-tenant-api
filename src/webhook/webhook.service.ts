import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IQueueService } from '../queue/queue.interface';
import { QUEUE_SERVICE, QUEUE_NAMES } from '../queue/queue.interface';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @Inject(QUEUE_SERVICE) private readonly queueService: IQueueService,
  ) {}

  /**
   * Enqueue raw webhook payload for async processing.
   */
  async enqueueWebhook(payload: any): Promise<void> {
    this.logger.debug('Enqueueing webhook payload');
    await this.queueService.publish(QUEUE_NAMES.WEBHOOK_PROCESS, payload);
  }
}
