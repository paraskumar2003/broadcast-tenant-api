import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TemplateService } from './template.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { TemplateDto, CreateTemplateDto } from './dto/template.dto';

@ApiTags('Templates')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('templates')
export class TemplateController {
  constructor(private readonly templateService: TemplateService) {}

  @Post('list')
  @ApiOperation({ summary: 'Fetch all WhatsApp templates for a project' })
  async fetchTemplates(@Body() body: TemplateDto) {
    const data = await this.templateService.fetchTemplates(body.projectId);
    return ApiResponseDto.success('Templates fetched', data);
  }

  @Post('detail')
  @ApiOperation({ summary: 'Fetch template details by ID' })
  async fetchTemplateDetail(
    @Body() body: { templateId: string; projectConfigId: string },
  ) {
    const data = await this.templateService.fetchTemplateById(
      body.templateId,
      body.projectConfigId,
    );
    return ApiResponseDto.success('Template details fetched', data);
  }

  @Post('create')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({
    summary: 'Create a new WhatsApp message template (Master/Super only)',
  })
  async createTemplate(@Body() dto: CreateTemplateDto) {
    const { projectId, ...templatePayload } = dto;
    const data = await this.templateService.createTemplate(
      projectId,
      templatePayload,
    );
    return ApiResponseDto.success('Template created', data);
  }
}
