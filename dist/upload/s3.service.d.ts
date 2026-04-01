import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
export declare class S3Service {
    private readonly configService;
    private readonly s3Client;
    private readonly bucketName;
    private readonly region;
    constructor(configService: ConfigService);
    getS3Client(): S3Client;
    getBucketName(): string;
    getRegion(): string;
}
