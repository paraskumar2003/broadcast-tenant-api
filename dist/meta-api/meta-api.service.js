"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MetaApiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaApiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let MetaApiService = MetaApiService_1 = class MetaApiService {
    httpService;
    configService;
    logger = new common_1.Logger(MetaApiService_1.name);
    baseUrl;
    apiVersion;
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.baseUrl = this.configService.get('meta.baseUrl');
        this.apiVersion = this.configService.get('meta.apiVersion');
    }
    async sendTemplateMessage(phoneNumberId, accessToken, recipientNumber, templateName, languageCode, components) {
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
    async sendTextMessage(phoneNumberId, accessToken, recipientNumber, text) {
        const url = `${this.baseUrl}/${this.apiVersion}/${phoneNumberId}/messages`;
        const payload = {
            messaging_product: 'whatsapp',
            to: recipientNumber,
            type: 'text',
            text: { body: text },
        };
        return this.postMessage(url, accessToken, payload, recipientNumber);
    }
    async fetchTemplates(wabaId, accessToken) {
        const url = `${this.baseUrl}/${this.apiVersion}/${wabaId}/message_templates?limit=200&access_token=${accessToken}`;
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            return data.data || [];
        }
        catch (error) {
            this.logger.error(`Failed to fetch templates for WABA ${wabaId}`, error.message);
            throw new common_1.HttpException(`Failed to fetch templates: ${error.response?.data?.error?.message || error.message}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async createTemplate(wabaId, accessToken, payload) {
        const url = `${this.baseUrl}/${this.apiVersion}/${wabaId}/message_templates`;
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Template created: ${data.id} (${payload.name})`);
            return data;
        }
        catch (error) {
            const errData = error.response?.data?.error || error.response?.data || {};
            this.logger.error(`Failed to create template: ${errData.message || error.message}`);
            console.log(errData, error.stack, payload);
            throw new common_1.HttpException(errData.error_user_msg || error.message, error.response?.status || common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async fetchTemplateById(templateId, accessToken) {
        const url = `${this.baseUrl}/${this.apiVersion}/${templateId}?access_token=${accessToken}`;
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url));
            return data.data || data;
        }
        catch (error) {
            this.logger.error(`Failed to fetch template ${templateId}`, error.message);
            throw new common_1.HttpException(`Failed to fetch template: ${error.response?.data?.error?.message || error.message}`, common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async postMessage(url, accessToken, payload, recipientNumber) {
        try {
            const { data } = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Message sent to ${recipientNumber}: ${data.messages?.[0]?.id}`);
            return data;
        }
        catch (error) {
            const errMsg = error.response?.data?.error?.message || error.message;
            this.logger.error(`Failed to send message to ${recipientNumber}: ${errMsg}`);
            throw new common_1.HttpException(`Meta API error: ${errMsg}`, error.response?.status || common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.MetaApiService = MetaApiService;
exports.MetaApiService = MetaApiService = MetaApiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], MetaApiService);
//# sourceMappingURL=meta-api.service.js.map