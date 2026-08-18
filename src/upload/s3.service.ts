import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    HeadObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const PUT_URL_EXPIRY_SECONDS = 5 * 60; // enough time for a browser upload to start
const GET_URL_EXPIRY_SECONDS = 15 * 60; // gallery display links

@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    private readonly bucketName: string;
    private readonly region: string;
    private readonly env: string;

    constructor(private readonly configService: ConfigService) {
        this.region = this.configService.get<string>('aws.region') || 'ap-south-1';
        this.bucketName = this.configService.get<string>('aws.s3.bucketName') || '';
        this.env = this.configService.get<string>('nodeEnv') || 'development';

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

    /** Builds a namespaced, collision-free object key for a new upload. */
    buildKey(originalFilename: string): string {
        const ext = originalFilename.split('.').pop() || 'bin';
        return `whatsapp-service/${this.env}/uploads/${uuid()}.${ext}`;
    }

    /** A short-lived URL the browser can PUT the file bytes to directly. */
    async getPresignedPutUrl(key: string, contentType: string): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });
        return getSignedUrl(this.s3Client, command, { expiresIn: PUT_URL_EXPIRY_SECONDS });
    }

    /** A short-lived URL for displaying/downloading a private object. */
    async getPresignedGetUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
        return getSignedUrl(this.s3Client, command, { expiresIn: GET_URL_EXPIRY_SECONDS });
    }

    /** Confirms an object exists after a direct browser upload and returns its true metadata. */
    async headObject(key: string): Promise<{ contentType: string; size: number }> {
        try {
            const result = await this.s3Client.send(
                new HeadObjectCommand({ Bucket: this.bucketName, Key: key }),
            );
            return {
                contentType: result.ContentType || 'application/octet-stream',
                size: result.ContentLength || 0,
            };
        } catch {
            throw new NotFoundException(
                'Upload not found in S3 — make sure the file finished uploading before confirming.',
            );
        }
    }

    /** Reads an object's bytes directly via the SDK (no public URL needed). */
    async getObjectBuffer(key: string): Promise<Buffer> {
        const result = await this.s3Client.send(
            new GetObjectCommand({ Bucket: this.bucketName, Key: key }),
        );
        const stream = result.Body as NodeJS.ReadableStream;
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }

    async deleteObject(key: string): Promise<void> {
        await this.s3Client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: key }));
    }
}
