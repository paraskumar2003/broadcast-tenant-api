import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export interface MetaSendResponse {
    messaging_product: string;
    contacts: Array<{
        input: string;
        wa_id: string;
    }>;
    messages: Array<{
        id: string;
        message_status?: string;
    }>;
}
export interface TemplateComponent {
    type: string;
    parameters?: any[];
    sub_type?: string;
    index?: number | string;
    cards?: any[];
}
export declare class MetaApiService {
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly baseUrl;
    private readonly apiVersion;
    constructor(httpService: HttpService, configService: ConfigService);
    sendTemplateMessage(phoneNumberId: string, accessToken: string, recipientNumber: string, templateName: string, languageCode: string, components: TemplateComponent[]): Promise<MetaSendResponse>;
    sendTextMessage(phoneNumberId: string, accessToken: string, recipientNumber: string, text: string): Promise<MetaSendResponse>;
    fetchTemplates(wabaId: string, accessToken: string): Promise<any[]>;
    createTemplate(wabaId: string, accessToken: string, payload: any): Promise<any>;
    fetchTemplateById(templateId: string, accessToken: string): Promise<any>;
    private postMessage;
}
