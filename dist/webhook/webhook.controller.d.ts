import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { WebhookService } from './webhook.service';
export declare class WebhookController {
    private readonly webhookService;
    private readonly configService;
    private readonly logger;
    constructor(webhookService: WebhookService, configService: ConfigService);
    verify(mode: string, token: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    receive(body: any): Promise<{
        statusCode: number;
        message: string;
        success: boolean;
    }>;
    verifyWebhook(mode: string, token: string, challenge: string): string;
}
