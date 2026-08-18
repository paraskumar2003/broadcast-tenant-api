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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const uuid_1 = require("uuid");
const PUT_URL_EXPIRY_SECONDS = 5 * 60;
const GET_URL_EXPIRY_SECONDS = 15 * 60;
let S3Service = class S3Service {
    configService;
    s3Client;
    bucketName;
    region;
    env;
    constructor(configService) {
        this.configService = configService;
        this.region = this.configService.get('aws.region') || 'ap-south-1';
        this.bucketName = this.configService.get('aws.s3.bucketName') || '';
        this.env = this.configService.get('nodeEnv') || 'development';
        this.s3Client = new client_s3_1.S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get('aws.accessKeyId') || '',
                secretAccessKey: this.configService.get('aws.secretAccessKey') || '',
            },
        });
    }
    getS3Client() {
        return this.s3Client;
    }
    getBucketName() {
        return this.bucketName;
    }
    getRegion() {
        return this.region;
    }
    buildKey(originalFilename) {
        const ext = originalFilename.split('.').pop() || 'bin';
        return `whatsapp-service/${this.env}/uploads/${(0, uuid_1.v4)()}.${ext}`;
    }
    async getPresignedPutUrl(key, contentType) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: PUT_URL_EXPIRY_SECONDS });
    }
    async getPresignedGetUrl(key) {
        const command = new client_s3_1.GetObjectCommand({ Bucket: this.bucketName, Key: key });
        return (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: GET_URL_EXPIRY_SECONDS });
    }
    async headObject(key) {
        try {
            const result = await this.s3Client.send(new client_s3_1.HeadObjectCommand({ Bucket: this.bucketName, Key: key }));
            return {
                contentType: result.ContentType || 'application/octet-stream',
                size: result.ContentLength || 0,
            };
        }
        catch {
            throw new common_1.NotFoundException('Upload not found in S3 — make sure the file finished uploading before confirming.');
        }
    }
    async getObjectBuffer(key) {
        const result = await this.s3Client.send(new client_s3_1.GetObjectCommand({ Bucket: this.bucketName, Key: key }));
        const stream = result.Body;
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }
    async deleteObject(key) {
        await this.s3Client.send(new client_s3_1.DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], S3Service);
//# sourceMappingURL=s3.service.js.map