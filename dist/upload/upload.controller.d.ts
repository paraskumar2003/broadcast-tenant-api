import { ApiResponseDto } from '../common/dto/api-response.dto';
export declare class UploadController {
    uploadSingle(file: Express.MulterS3.File): Promise<ApiResponseDto<{
        url: string;
        key: string;
        bucket: string;
        contentType: string;
        size: number;
    }>>;
    uploadMultiple(files: Express.MulterS3.File[]): Promise<ApiResponseDto<{
        url: string;
        key: string;
        bucket: string;
        contentType: string;
        size: number;
    }[]>>;
}
