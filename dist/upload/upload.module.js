"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadModule = exports.MULTER_OPTIONS = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const s3_service_1 = require("./s3.service");
const media_service_1 = require("./media.service");
const upload_controller_1 = require("./upload.controller");
const media_controller_1 = require("./media.controller");
const media_schema_1 = require("./schemas/media.schema");
const tagging_module_1 = require("../tagging/tagging.module");
const multerS3 = require('multer-s3');
exports.MULTER_OPTIONS = 'MULTER_OPTIONS';
let UploadModule = class UploadModule {
};
exports.UploadModule = UploadModule;
exports.UploadModule = UploadModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: media_schema_1.Media.name, schema: media_schema_1.MediaSchema }]),
            platform_express_1.MulterModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const s3Client = new client_s3_1.S3Client({
                        region: configService.get('aws.region') || 'ap-south-1',
                        credentials: {
                            accessKeyId: configService.get('aws.accessKeyId') || '',
                            secretAccessKey: configService.get('aws.secretAccessKey') || '',
                        },
                    });
                    return {
                        storage: multerS3({
                            s3: s3Client,
                            bucket: configService.get('aws.s3.bucketName') || '',
                            contentType: multerS3.AUTO_CONTENT_TYPE,
                            key: (_req, file, cb) => {
                                const ext = file.originalname.split('.').pop();
                                const env = configService.get('nodeEnv') || 'development';
                                const filename = `${(0, uuid_1.v4)()}.${ext}`;
                                cb(null, `whatsapp-service/${env}/uploads/${filename}`);
                            },
                        }),
                        fileFilter: (_req, _file, cb) => {
                            cb(null, true);
                        },
                        limits: {
                            fileSize: 16 * 1024 * 1024,
                        },
                    };
                },
            }),
            tagging_module_1.TaggingModule,
        ],
        providers: [
            s3_service_1.S3Service,
            media_service_1.MediaService,
            { provide: exports.MULTER_OPTIONS, useValue: true },
        ],
        controllers: [upload_controller_1.UploadController, media_controller_1.MediaController],
        exports: [s3_service_1.S3Service, media_service_1.MediaService],
    })
], UploadModule);
//# sourceMappingURL=upload.module.js.map