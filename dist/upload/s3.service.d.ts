import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
export declare class S3Service {
    private readonly configService;
    private readonly s3Client;
    private readonly bucketName;
    private readonly region;
    private readonly env;
    constructor(configService: ConfigService);
    getS3Client(): S3Client;
    getBucketName(): string;
    getRegion(): string;
    buildKey(originalFilename: string): string;
    getPresignedPutUrl(key: string, contentType: string): Promise<string>;
    getPresignedGetUrl(key: string): Promise<string>;
    headObject(key: string): Promise<{
        contentType: string;
        size: number;
    }>;
    getObjectBuffer(key: string): Promise<Buffer>;
    deleteObject(key: string): Promise<void>;
}
