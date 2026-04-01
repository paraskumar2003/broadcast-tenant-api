import { MetaApiService } from '../meta-api/meta-api.service';
import { ProjectService } from '../project/project.service';
import { TaggingService } from '../tagging/tagging.service';
export declare class TemplateService {
    private readonly metaApi;
    private readonly projectService;
    private readonly taggingService;
    constructor(metaApi: MetaApiService, projectService: ProjectService, taggingService: TaggingService);
    fetchTemplates(projectId: string): Promise<any[]>;
    fetchTemplateById(templateId: string, projectConfigId: string): Promise<any>;
    createTemplate(projectId: string, templatePayload: any): Promise<any>;
}
