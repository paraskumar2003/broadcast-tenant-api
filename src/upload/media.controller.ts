import {
    Controller,
    Post,
    Get,
    Put,
    Delete,
    Param,
    Body,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { MediaService } from './media.service';
import { CreateMediaDto, UpdateMediaDto } from './dto/media.dto';

@ApiTags('Media Gallery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('media')
export class MediaController {
    constructor(private readonly mediaService: MediaService) { }

    // ─── Upload single file + save to gallery ────────────────────────

    @Post('upload')
    @Roles(UserRole.MASTER, UserRole.SUPER)
    @ApiOperation({ summary: 'Upload a single file and add to project gallery' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                projectId: { type: 'string', example: '6482c4adda0e29b69bfec072' },
                alt: { type: 'string', example: 'Campaign banner' },
                mediaType: { type: 'string', enum: ['image', 'video', 'document', 'other'] },
            },
            required: ['file', 'projectId'],
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadSingle(
        @UploadedFile() file: Express.MulterS3.File,
        @Body() body: CreateMediaDto,
    ) {
        if (!file) throw new BadRequestException('No file provided');

        const media = await this.mediaService.create({
            projectId: body.projectId,
            url: file.location,
            key: file.key,
            filename: file.originalname,
            contentType: file.contentType || file.mimetype,
            size: file.size,
            alt: body.alt,
            mediaType: body.mediaType,
        });

        return ApiResponseDto.success('Media uploaded', media);
    }

    // ─── Upload multiple files + save to gallery ─────────────────────

    @Post('upload/multiple')
    @Roles(UserRole.MASTER, UserRole.SUPER)
    @ApiOperation({ summary: 'Upload multiple files and add to project gallery (max 10)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: { type: 'array', items: { type: 'string', format: 'binary' } },
                projectId: { type: 'string', example: '6482c4adda0e29b69bfec072' },
            },
            required: ['files', 'projectId'],
        },
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    async uploadMultiple(
        @UploadedFiles() files: Express.MulterS3.File[],
        @Body() body: CreateMediaDto,
    ) {
        if (!files || files.length === 0) throw new BadRequestException('No files provided');

        const items = files.map((f) => ({
            projectId: body.projectId,
            url: f.location,
            key: f.key,
            filename: f.originalname,
            contentType: f.contentType || f.mimetype,
            size: f.size,
            alt: body.alt,
            mediaType: body.mediaType,
        }));

        const media = await this.mediaService.createMany(items);
        return ApiResponseDto.success('Media uploaded', media);
    }

    // ─── List gallery by project ─────────────────────────────────────

    @Get('project/:projectId')
    @ApiOperation({ summary: 'List all media for a project (gallery)' })
    async listByProject(@Param('projectId') projectId: string) {
        const data = await this.mediaService.listByProject(projectId);
        return ApiResponseDto.success('Media gallery fetched', data);
    }

    // ─── Get single media ────────────────────────────────────────────

    @Get(':id')
    @ApiOperation({ summary: 'Get a single media item by ID' })
    async getById(@Param('id') id: string) {
        const data = await this.mediaService.getById(id);
        return ApiResponseDto.success('Media fetched', data);
    }

    // ─── Update media metadata ───────────────────────────────────────

    @Put(':id')
    @Roles(UserRole.MASTER, UserRole.SUPER)
    @ApiOperation({ summary: 'Update media metadata (alt, filename, mediaType)' })
    async update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
        const data = await this.mediaService.update(id, dto);
        return ApiResponseDto.success('Media updated', data);
    }

    // ─── Delete media (soft) ─────────────────────────────────────────

    @Delete(':id')
    @Roles(UserRole.MASTER, UserRole.SUPER)
    @ApiOperation({ summary: 'Delete a media item (soft delete)' })
    async delete(@Param('id') id: string) {
        await this.mediaService.delete(id);
        return ApiResponseDto.success('Media deleted');
    }
}
