import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { MediaService } from './media.service';
import { PresignMediaDto, ConfirmMediaDto, UpdateMediaDto, MetaHandleDto } from './dto/media.dto';

@ApiTags('Media Gallery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  // ─── Step 1: get a presigned URL to PUT the file directly to S3 ──

  @Post('presign')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Get a short-lived URL to upload a file directly to S3 (private bucket)' })
  async presign(@Body() dto: PresignMediaDto) {
    const data = await this.mediaService.presignUpload(dto.projectId, dto.filename, dto.contentType);
    return ApiResponseDto.success('Presigned upload URL generated', data);
  }

  // ─── Step 2: after the browser PUTs the bytes, register the gallery item ──

  @Post('confirm')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Confirm a direct S3 upload and add it to the project gallery' })
  async confirm(@Body() dto: ConfirmMediaDto) {
    const data = await this.mediaService.confirmUpload(dto);
    return ApiResponseDto.success('Media uploaded', data);
  }

  // ─── List gallery by project ─────────────────────────────────────

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List all media for a project (gallery)' })
  async listByProject(@Param('projectId') projectId: string) {
    const data = await this.mediaService.listByProject(projectId);
    return ApiResponseDto.success('Media gallery fetched', data);
  }

  // ─── Convert a gallery item / URL into a Meta template header handle ──

  @Post('meta-handle')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({
    summary:
      'Upload media to Meta via the Resumable Upload API and return a header handle usable in template example.header_handle',
  })
  async getMetaHandle(@Body() dto: MetaHandleDto) {
    const data = await this.mediaService.generateMetaHandle(dto.projectId, {
      mediaId: dto.mediaId,
      url: dto.url,
    });
    return ApiResponseDto.success('Meta media handle generated', data);
  }

  // ─── Get single media ────────────────────────────────────────────

  @Get(':id')
  @ApiOperation({ summary: 'Get a single media item by ID' })
  async getById(@Param('id') id: string) {
    const data = await this.mediaService.getByIdWithUrl(id);
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
