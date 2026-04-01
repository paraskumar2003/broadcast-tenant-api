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
exports.ProjectService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const project_schema_1 = require("./schemas/project.schema");
const project_configuration_schema_1 = require("./schemas/project-configuration.schema");
const user_schema_1 = require("../user/schemas/user.schema");
let ProjectService = class ProjectService {
    projectModel;
    configModel;
    constructor(projectModel, configModel) {
        this.projectModel = projectModel;
        this.configModel = configModel;
    }
    async createProject(name, slug, createdBy) {
        const existing = await this.projectModel.findOne({ slug, status: 'active' });
        if (existing) {
            throw new Error('Project with this slug already exists');
        }
        return this.projectModel.create({
            name,
            slug,
            createdBy: createdBy ? new mongoose_2.Types.ObjectId(createdBy) : null,
        });
    }
    async listProjectsForUser(user) {
        const baseFilter = { status: 'active' };
        if (user.role === user_schema_1.UserRole.MASTER) {
            return this.projectModel.find(baseFilter).sort({ createdAt: -1 });
        }
        if (user.role === user_schema_1.UserRole.SUPER) {
            return this.projectModel
                .find({ ...baseFilter, createdBy: new mongoose_2.Types.ObjectId(user.sub) })
                .sort({ createdAt: -1 });
        }
        if (user.role === user_schema_1.UserRole.EXECUTIVE) {
            if (!user.accessibleProjectIds || user.accessibleProjectIds.length === 0) {
                return [];
            }
            return this.projectModel
                .find({ ...baseFilter, _id: { $in: user.accessibleProjectIds } })
                .sort({ createdAt: -1 });
        }
        return [];
    }
    async deleteProject(id) {
        return this.projectModel.findByIdAndUpdate(id, { status: 'inactive' });
    }
    async createConfiguration(data) {
        const project = await this.projectModel.findById(data.projectId);
        if (!project) {
            throw new Error('Project not found');
        }
        const existing = await this.configModel.findOne({ projectId: data.projectId });
        if (existing) {
            throw new Error('Project configuration already exists');
        }
        const config = new this.configModel({
            projectId: new mongoose_2.Types.ObjectId(data.projectId),
            whatsappBusinessAccountId: data.whatsappBusinessAccountId,
            phoneNumberId: data.phoneNumberId,
            phoneNumber: data.phoneNumber,
            accessToken: data.accessToken,
            logo: data.logo,
        });
        return config.save();
    }
    async updateConfiguration(id, data) {
        const config = await this.configModel.findById(id);
        if (!config) {
            throw new Error('Configuration not found');
        }
        config.whatsappBusinessAccountId = data.whatsappBusinessAccountId;
        config.phoneNumberId = data.phoneNumberId;
        config.phoneNumber = data.phoneNumber;
        config.accessToken = data.accessToken;
        config.logo = data.logo;
        return config.save();
    }
    async getConfigurationById(id) {
        const project = await this.projectModel.findById(id);
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        let config = await this.configModel.findOne({ projectId: project._id });
        if (!config)
            throw new common_1.NotFoundException('Project configuration not found');
        return config;
    }
    async getConfigurationByProjectId(projectId) {
        const config = await this.configModel.findOne({
            projectId: new mongoose_2.Types.ObjectId(projectId),
            status: 'active',
        });
        if (!config)
            throw new common_1.NotFoundException('Active project configuration not found');
        return config;
    }
    async getConfigurationByWabaId(wabaId) {
        return this.configModel.findOne({
            whatsappBusinessAccountId: wabaId,
            status: 'active',
        });
    }
    async listConfigurations() {
        return this.configModel.find({ status: 'active' }).sort({ createdAt: -1 }).populate('projectId');
    }
    async deleteConfiguration(id) {
        return this.configModel.findByIdAndUpdate(id, { status: 'inactive' });
    }
};
exports.ProjectService = ProjectService;
exports.ProjectService = ProjectService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(project_schema_1.Project.name)),
    __param(1, (0, mongoose_1.InjectModel)(project_configuration_schema_1.ProjectConfiguration.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], ProjectService);
//# sourceMappingURL=project.service.js.map