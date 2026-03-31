import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProjectService } from './project.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../user/schemas/user.schema';
import { UserService } from '../user/user.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { ProjectDto } from './dto/project.dto';
import { ProjectConfigurationDto } from './dto/project-configuration.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
  ) { }

  @Post()
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Create a new project (Master/Super only)' })
  async create(@Body() body: ProjectDto, @CurrentUser() user: any) {
    const data = await this.projectService.createProject(body.name, body.slug, user.sub);
    return ApiResponseDto.success('Project created', data);
  }

  @Get()
  @ApiOperation({ summary: 'List projects (role-filtered)' })
  async list(@CurrentUser() user: any) {
    let accessibleProjectIds;
    if (user.role === UserRole.EXECUTIVE) {
      accessibleProjectIds = await this.userService.getAccessibleProjectIds(user.sub);
    }

    const data = await this.projectService.listProjectsForUser({
      sub: user.sub,
      role: user.role,
      accessibleProjectIds,
    });
    return ApiResponseDto.success('Projects fetched', data);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Delete a project (Master/Super only)' })
  async delete(@Param('id') id: string) {
    await this.projectService.deleteProject(id);
    return ApiResponseDto.success('Project deleted');
  }

  // --- Configurations ---

  @Post('configurations')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Create project configuration (WABA credentials)' })
  async createConfig(@Body() body: ProjectConfigurationDto) {
    const data = await this.projectService.createConfiguration(body);
    return ApiResponseDto.success('Configuration created', data);
  }

  @Get('configurations')
  @ApiOperation({ summary: 'List all configurations' })
  async listConfigs() {
    const data = await this.projectService.listConfigurations();
    return ApiResponseDto.success('Configurations fetched', data);
  }

  @Get('configurations/:projectId')
  @ApiOperation({ summary: 'Get configuration by Project ID' })
  async getConfig(@Param('projectId') projectId: string) {
    const data = await this.projectService.getConfigurationById(projectId);
    return ApiResponseDto.success('Configuration fetched', data);
  }

  @Put('configurations/:id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Update a configuration' })
  async updateConfig(@Param('id') id: string, @Body() body: ProjectConfigurationDto) {
    const data = await this.projectService.updateConfiguration(id, body);
    return ApiResponseDto.success('Configuration updated', data);
  }

  @Delete('configurations/:id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Delete a configuration' })
  async deleteConfig(@Param('id') id: string) {
    await this.projectService.deleteConfiguration(id);
    return ApiResponseDto.success('Configuration deleted');
  }
}
