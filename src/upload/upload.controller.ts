import {
    Controller,
    Post,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
    Inject,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiResponseDto } from '../common/dto/api-response.dto';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {

    @Post('single')
    @ApiOperation({ summary: 'Upload a single file to S3' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingle(@UploadedFile() file: Express.MulterS3.File) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }
        return ApiResponseDto.success('File uploaded', {
            url: file.location,
            key: file.key,
            bucket: file.bucket,
            contentType: file.contentType,
            size: file.size,
        });
    }

    @Post('multiple')
    @ApiOperation({ summary: 'Upload multiple files to S3 (max 10)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: { type: 'string', format: 'binary' },
                },
            },
            required: ['files'],
        },
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultiple(@UploadedFiles() files: Express.MulterS3.File[]) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }
        const uploaded = files.map((f) => ({
            url: f.location,
            key: f.key,
            bucket: f.bucket,
            contentType: f.contentType,
            size: f.size,
        }));
        return ApiResponseDto.success('Files uploaded', uploaded);
    }
}
