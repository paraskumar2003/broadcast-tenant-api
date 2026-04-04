import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Res,
  HttpCode,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { WebhookService } from './webhook.service';

@ApiTags('Webhook')
@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly configService: ConfigService,
  ) { }

  /**
   * Meta webhook verification (GET).
   * Meta sends hub.mode, hub.verify_token, and hub.challenge.
   */
  @Get()
  @ApiOperation({ summary: 'Webhook verification endpoint' })
  @ApiQuery({ name: 'hub.mode', required: false })
  @ApiQuery({ name: 'hub.verify_token', required: false })
  @ApiQuery({ name: 'hub.challenge', required: false })
  verify(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const expectedToken = this.configService.get<string>('webhook.verifyToken');

    if (mode === 'subscribe' && token === expectedToken) {
      this.logger.log('Webhook verified');
      return res.status(200).send(challenge);
    }

    this.logger.warn(`Webhook verification failed: token=${token}`);
    return res.status(403).send('Forbidden');
  }

  /**
   * Receive webhook events from Meta (POST).
   */
  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Receive webhook events from Meta' })
  async receive(@Body() body: any) {
    await this.webhookService.enqueueWebhook(body);
    return { statusCode: 200, message: 'Received', success: true };
  }

  /**
 * Verify webhook with Meta (GET).
 */
  @Get()
  @ApiOperation({ summary: 'Verify Meta webhook' })
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const VERIFY_TOKEN = this.configService.get<string>('webhook.verifyToken');

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return challenge;
    }

    throw new ForbiddenException('Verification token mismatch');
  }
}
