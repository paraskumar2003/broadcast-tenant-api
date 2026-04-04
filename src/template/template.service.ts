import { Injectable } from '@nestjs/common';
import { MetaApiService } from '../meta-api/meta-api.service';
import { ProjectService } from '../project/project.service';
import { TaggingService } from '../tagging/tagging.service';
import { EntityType } from '../tagging/dto/tagging.dto';

@Injectable()
export class TemplateService {
  constructor(
    private readonly metaApi: MetaApiService,
    private readonly projectService: ProjectService,
    private readonly taggingService: TaggingService,
  ) {}

  async fetchTemplates(projectId: string) {
    const config =
      await this.projectService.getConfigurationByProjectId(projectId);
    const templates = await this.metaApi.fetchTemplates(
      config.whatsappBusinessAccountId,
      config.accessToken,
    );

    const tagsMap = await this.taggingService.getTagsForProjectEntities(
      projectId,
      EntityType.TEMPLATE,
    );

    return templates.map((t: any) => ({
      ...t,
      tags: tagsMap[t.name] || [],
    }));
  }

  async fetchTemplateById(templateId: string, projectConfigId: string) {
    const config =
      await this.projectService.getConfigurationById(projectConfigId);
    return this.metaApi.fetchTemplateById(templateId, config.accessToken);
  }

  async createTemplate(projectId: string, templatePayload: any) {
    const config =
      await this.projectService.getConfigurationByProjectId(projectId);
    return this.metaApi.createTemplate(
      config.whatsappBusinessAccountId,
      config.accessToken,
      templatePayload,
    );
  }
}
