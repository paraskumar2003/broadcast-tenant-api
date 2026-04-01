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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const project_service_1 = require("./project.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_schema_1 = require("../user/schemas/user.schema");
const user_service_1 = require("../user/user.service");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const project_dto_1 = require("./dto/project.dto");
const project_configuration_dto_1 = require("./dto/project-configuration.dto");
let ProjectController = class ProjectController {
    projectService;
    userService;
    constructor(projectService, userService) {
        this.projectService = projectService;
        this.userService = userService;
    }
    async create(body, user) {
        const data = await this.projectService.createProject(body.name, body.slug, user.sub);
        return api_response_dto_1.ApiResponseDto.success('Project created', data);
    }
    async list(user) {
        let accessibleProjectIds;
        if (user.role === user_schema_1.UserRole.EXECUTIVE) {
            accessibleProjectIds = await this.userService.getAccessibleProjectIds(user.sub);
        }
        const data = await this.projectService.listProjectsForUser({
            sub: user.sub,
            role: user.role,
            accessibleProjectIds,
        });
        return api_response_dto_1.ApiResponseDto.success('Projects fetched', data);
    }
    async delete(id) {
        await this.projectService.deleteProject(id);
        return api_response_dto_1.ApiResponseDto.success('Project deleted');
    }
    async createConfig(body) {
        const data = await this.projectService.createConfiguration(body);
        return api_response_dto_1.ApiResponseDto.success('Configuration created', data);
    }
    async listConfigs() {
        const data = await this.projectService.listConfigurations();
        return api_response_dto_1.ApiResponseDto.success('Configurations fetched', data);
    }
    async getConfig(projectId) {
        const data = await this.projectService.getConfigurationById(projectId);
        return api_response_dto_1.ApiResponseDto.success('Configuration fetched', data);
    }
    async updateConfig(id, body) {
        const data = await this.projectService.updateConfiguration(id, body);
        return api_response_dto_1.ApiResponseDto.success('Configuration updated', data);
    }
    async deleteConfig(id) {
        await this.projectService.deleteConfiguration(id);
        return api_response_dto_1.ApiResponseDto.success('Configuration deleted');
    }
};
exports.ProjectController = ProjectController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new project (Master/Super only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_dto_1.ProjectDto, Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List projects (role-filtered)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "list", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a project (Master/Super only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('configurations'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Create project configuration (WABA credentials)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [project_configuration_dto_1.ProjectConfigurationDto]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "createConfig", null);
__decorate([
    (0, common_1.Get)('configurations'),
    (0, swagger_1.ApiOperation)({ summary: 'List all configurations' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "listConfigs", null);
__decorate([
    (0, common_1.Get)('configurations/:projectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get configuration by Project ID' }),
    __param(0, (0, common_1.Param)('projectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)('configurations/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Update a configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, project_configuration_dto_1.ProjectConfigurationDto]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "updateConfig", null);
__decorate([
    (0, common_1.Delete)('configurations/:id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a configuration' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProjectController.prototype, "deleteConfig", null);
exports.ProjectController = ProjectController = __decorate([
    (0, swagger_1.ApiTags)('Projects'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('projects'),
    __metadata("design:paramtypes", [project_service_1.ProjectService,
        user_service_1.UserService])
], ProjectController);
//# sourceMappingURL=project.controller.js.map