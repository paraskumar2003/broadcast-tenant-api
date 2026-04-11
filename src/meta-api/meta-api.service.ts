import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface MetaSendResponse {
  messaging_product: string;
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string; message_status?: string }>;
}

export interface TemplateComponent {
  type: string;
  parameters?: any[];
  sub_type?: string;
  index?: number | string;
  cards?: any[];
}

@Injectable()
export class MetaApiService {
  private readonly logger = new Logger(MetaApiService.name);
  private readonly baseUrl: string;
  private readonly apiVersion: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('meta.baseUrl')!;
    this.apiVersion = this.configService.get<string>('meta.apiVersion')!;
  }

  /**
   * Send a template-based WhatsApp message.
   */
  async sendTemplateMessage(
    phoneNumberId: string,
    accessToken: string,
    recipientNumber: string,
    templateName: string,
    languageCode: string,
    components: TemplateComponent[],
  ): Promise<MetaSendResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    };

    return this.postMessage(url, accessToken, payload, recipientNumber);
  }

  /**
   * Send a free-form text WhatsApp message.
   */
  async sendTextMessage(
    phoneNumberId: string,
    accessToken: string,
    recipientNumber: string,
    text: string,
  ): Promise<MetaSendResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;

    const payload = {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: 'text',
      text: { body: text },
    };

    return this.postMessage(url, accessToken, payload, recipientNumber);
  }

  /**
   * Send a media WhatsApp message (image, video, audio, document).
   */
  async sendMediaMessage(
    phoneNumberId: string,
    accessToken: string,
    recipientNumber: string,
    mediaType: 'image' | 'video' | 'audio' | 'document',
    mediaUrl: string,
    caption?: string,
    fileName?: string,
  ): Promise<MetaSendResponse> {
    const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;

    const mediaBody: Record<string, any> = { link: mediaUrl };
    if (caption) mediaBody.caption = caption;
    if (mediaType === 'document' && fileName) {
      mediaBody.filename = fileName;
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: recipientNumber,
      type: mediaType,
      [mediaType]: mediaBody,
    };

    return this.postMessage(url, accessToken, payload, recipientNumber);
  }

  /**
   * Fetch all message templates from a WABA.
   */
  async fetchTemplates(wabaId: string, accessToken: string): Promise<any[]> {
    const url = `${this.baseUrl}/${this.apiVersion}/${wabaId}/message_templates?limit=200&access_token=${accessToken}`;

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      return data.data || [];
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch templates for WABA ${wabaId}`,
        error.message,
      );
      throw new HttpException(
        `Failed to fetch templates: ${error.response?.data?.error?.message || error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Create a new message template on a WABA.
   */
  async createTemplate(
    wabaId: string,
    accessToken: string,
    payload: any,
  ): Promise<any> {
    const url = `${this.baseUrl}/${this.apiVersion}/${wabaId}/message_templates`;

    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(`Template created: ${data.id} (${payload.name})`);
      return data;
    } catch (error: any) {
      const errData = error.response?.data?.error || error.response?.data || {};
      this.logger.error(
        `Failed to create template: ${errData.message || error.message}`,
      );
      console.log(errData, error.stack, payload);
      throw new HttpException(
        errData.error_user_msg || error.message,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Fetch a single template by its ID.
   */
  async fetchTemplateById(
    templateId: string,
    accessToken: string,
  ): Promise<any> {
    const url = `${this.baseUrl}/${this.apiVersion}/${templateId}?access_token=${accessToken}`;

    try {
      const { data } = await firstValueFrom(this.httpService.get(url));
      return data.data || data;
    } catch (error: any) {
      this.logger.error(
        `Failed to fetch template ${templateId}`,
        error.message,
      );
      throw new HttpException(
        `Failed to fetch template: ${error.response?.data?.error?.message || error.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private async postMessage(
    url: string,
    accessToken: string,
    payload: any,
    recipientNumber: string,
  ): Promise<MetaSendResponse> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(url, payload, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      this.logger.log(
        `Message sent to ${recipientNumber}: ${data.messages?.[0]?.id}`,
      );
      return data;
    } catch (error: any) {
      const errMsg = error.response?.data?.error?.message || error.message;
      this.logger.error(
        `Failed to send message to ${recipientNumber}: ${errMsg}`,
      );
      throw new HttpException(
        `Meta API error: ${errMsg}`,
        error.response?.status || HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
