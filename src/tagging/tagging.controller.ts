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
import { TaggingService } from './tagging.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import {
  CreateTagDto,
  UpdateTagDto,
  AttachDetachTagDto,
  EntityType,
} from './dto/tagging.dto';

@ApiTags('Tagging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tags')
export class TaggingController {
  constructor(private readonly taggingService: TaggingService) {}

  @Post()
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Create a new tag for a project' })
  async createTag(@Body() dto: CreateTagDto) {
    const data = await this.taggingService.createTag(dto);
    return ApiResponseDto.success('Tag created successfully', data);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'List all tags for a project' })
  async listTags(@Param('projectId') projectId: string) {
    const data = await this.taggingService.listTagsByProject(projectId);
    return ApiResponseDto.success('Tags fetched successfully', data);
  }

  @Put(':id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Update a tag' })
  async updateTag(@Param('id') id: string, @Body() dto: UpdateTagDto) {
    const data = await this.taggingService.updateTag(id, dto);
    return ApiResponseDto.success('Tag updated successfully', data);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Delete a tag (cascades to entity mappings)' })
  async deleteTag(@Param('id') id: string) {
    const data = await this.taggingService.deleteTag(id);
    return ApiResponseDto.success(data.message);
  }

  @Post('attach')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({
    summary: 'Attach a tag to an entity (upload, template, contact)',
  })
  async attachTag(@Body() dto: AttachDetachTagDto) {
    const data = await this.taggingService.attachTag(dto);
    return ApiResponseDto.success(data.message);
  }

  @Post('detach')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Detach a tag from an entity' })
  async detachTag(@Body() dto: AttachDetachTagDto) {
    const data = await this.taggingService.detachTag(dto);
    return ApiResponseDto.success(data.message);
  }

  @Get('entity/:projectId/:entityType/:entityId')
  @ApiOperation({ summary: 'Get all tags attached to a specific entity' })
  async getEntityTags(
    @Param('projectId') projectId: string,
    @Param('entityType') entityType: EntityType,
    @Param('entityId') entityId: string,
  ) {
    const data = await this.taggingService.getTagsForEntity(
      projectId,
      entityType,
      entityId,
    );
    return ApiResponseDto.success('Entity tags fetched successfully', data);
  }
}
