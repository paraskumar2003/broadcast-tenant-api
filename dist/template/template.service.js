"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateService = void 0;
const common_1 = require("@nestjs/common");
const meta_api_service_1 = require("../meta-api/meta-api.service");
const project_service_1 = require("../project/project.service");
const tagging_service_1 = require("../tagging/tagging.service");
const tagging_dto_1 = require("../tagging/dto/tagging.dto");
let TemplateService = class TemplateService {
    metaApi;
    projectService;
    taggingService;
    constructor(metaApi, projectService, taggingService) {
        this.metaApi = metaApi;
        this.projectService = projectService;
        this.taggingService = taggingService;
    }
    async fetchTemplates(projectId) {
        const config = await this.projectService.getConfigurationByProjectId(projectId);
        const templates = await this.metaApi.fetchTemplates(config.whatsappBusinessAccountId, config.accessToken);
        const tagsMap = await this.taggingService.getTagsForProjectEntities(projectId, tagging_dto_1.EntityType.TEMPLATE);
        return templates.map((t) => ({
            ...t,
            tags: tagsMap[t.name] || [],
        }));
    }
    async fetchTemplateById(templateId, projectConfigId) {
        const config = await this.projectService.getConfigurationById(projectConfigId);
        return this.metaApi.fetchTemplateById(templateId, config.accessToken);
    }
    async createTemplate(projectId, templatePayload) {
        const config = await this.projectService.getConfigurationByProjectId(projectId);
        return this.metaApi.createTemplate(config.whatsappBusinessAccountId, config.accessToken, templatePayload);
    }
};
exports.TemplateService = TemplateService;
exports.TemplateService = TemplateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [meta_api_service_1.MetaApiService,
        project_service_1.ProjectService,
        tagging_service_1.TaggingService])
], TemplateService);
//# sourceMappingURL=template.service.js.map