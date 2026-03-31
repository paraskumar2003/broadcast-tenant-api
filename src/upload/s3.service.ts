import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly region: string;

    constructor(private readonly configService: ConfigService) {
        this.region = this.configService.get<string>('aws.region') || 'ap-south-1';
        this.bucketName = this.configService.get<string>('aws.s3.bucketName') || '';

        this.s3Client = new S3Client({
            region: this.region,
            credentials: {
                accessKeyId: this.configService.get<string>('aws.accessKeyId') || '',
                secretAccessKey: this.configService.get<string>('aws.secretAccessKey') || '',
            },
        });
    }

    getS3Client(): S3Client {
        return this.s3Client;
    }

    getBucketName(): string {
        return this.bucketName;
    }

    getRegion(): string {
        return this.region;
    }
}
