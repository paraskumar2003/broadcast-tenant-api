import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import { v4 as uuid } from 'uuid';
import { S3Service } from './s3.service';
import { MediaService } from './media.service';
import { UploadController } from './upload.controller';
import { MediaController } from './media.controller';
import { Media, MediaSchema } from './schemas/media.schema';
import { TaggingModule } from '../tagging/tagging.module';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const multerS3 = require('multer-s3');

export const MULTER_OPTIONS = 'MULTER_OPTIONS';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Media.name, schema: MediaSchema }]),
        MulterModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const s3Client = new S3Client({
                    region: configService.get<string>('aws.region') || 'ap-south-1',
                    credentials: {
                        accessKeyId: configService.get<string>('aws.accessKeyId') || '',
                        secretAccessKey: configService.get<string>('aws.secretAccessKey') || '',
                    },
                });

                return {
                    storage: multerS3({
                        s3: s3Client,
                        bucket: configService.get<string>('aws.s3.bucketName') || '',
                        contentType: multerS3.AUTO_CONTENT_TYPE,
                        key: (_req: any, file: any, cb: any) => {
                            const ext = file.originalname.split('.').pop();
                            const env = configService.get<string>('nodeEnv') || 'development';
                            const filename = `${uuid()}.${ext}`;
                            cb(null, `whatsapp-service/${env}/uploads/${filename}`);
                        },
                    }),
                    fileFilter: (_req: any, _file: any, cb: any) => {
                        cb(null, true);
                    },
                    limits: {
                        fileSize: 16 * 1024 * 1024, // 16 MB
                    },
                };
            },
        }),
        TaggingModule,
    ],
    providers: [
        S3Service,
        MediaService,
        { provide: MULTER_OPTIONS, useValue: true },
    ],
    controllers: [UploadController, MediaController],
    exports: [S3Service, MediaService],
})
export class UploadModule { }
