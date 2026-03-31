import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import {
  ProjectConfiguration,
  ProjectConfigurationDocument,
} from './schemas/project-configuration.schema';
import { UserRole } from '../user/schemas/user.schema';
import { ProjectConfigurationDto } from './dto/project-configuration.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<ProjectDocument>,
    @InjectModel(ProjectConfiguration.name)
    private readonly configModel: Model<ProjectConfigurationDocument>,
  ) { }

  // --- Project CRUD ---

  async createProject(name: string, slug: string, createdBy?: string) {
    const existing = await this.projectModel.findOne({ slug, status: 'active' });
    if (existing) {
      throw new Error('Project with this slug already exists');
    }
    return this.projectModel.create({
      name,
      slug,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : null,
    });
  }

  /**
   * Role-based project listing:
   * - Master: all active projects
   * - Super: only own projects (createdBy)
   * - Executive: only granted projectIds
   */
  async listProjectsForUser(user: {
    sub: string;
    role: UserRole;
    accessibleProjectIds?: Types.ObjectId[];
  }) {
    const baseFilter: any = { status: 'active' };

    if (user.role === UserRole.MASTER) {
      // Master sees all
      return this.projectModel.find(baseFilter).sort({ createdAt: -1 });
    }

    if (user.role === UserRole.SUPER) {
      // Super sees only own projects
      return this.projectModel
        .find({ ...baseFilter, createdBy: new Types.ObjectId(user.sub) })
        .sort({ createdAt: -1 });
    }

    if (user.role === UserRole.EXECUTIVE) {
      // Executive sees only granted projects
      if (!user.accessibleProjectIds || user.accessibleProjectIds.length === 0) {
        return [];
      }
      return this.projectModel
        .find({ ...baseFilter, _id: { $in: user.accessibleProjectIds } })
        .sort({ createdAt: -1 });
    }

    return [];
  }

  async deleteProject(id: string) {
    return this.projectModel.findByIdAndUpdate(id, { status: 'inactive' });
  }

  // --- ProjectConfiguration CRUD ---

  async createConfiguration(data: ProjectConfigurationDto) {

    /** a project must exist with the projectId */
    const project = await this.projectModel.findById(data.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const existing = await this.configModel.findOne({ projectId: data.projectId });
    if (existing) {
      throw new Error('Project configuration already exists');
    }
    const config = new this.configModel({
      projectId: new Types.ObjectId(data.projectId),
      whatsappBusinessAccountId: data.whatsappBusinessAccountId,
      phoneNumberId: data.phoneNumberId,
      phoneNumber: data.phoneNumber,
      accessToken: data.accessToken,
      logo: data.logo,
    });
    return config.save();
  }

  async updateConfiguration(id: string, data: ProjectConfigurationDto) {

    /** a configuration must exist with the id */
    const config = await this.configModel.findById(id);
    if (!config) {
      throw new Error('Configuration not found');
    }

    /** map each key individually but not projectId */
    config.whatsappBusinessAccountId = data.whatsappBusinessAccountId;
    config.phoneNumberId = data.phoneNumberId;
    config.phoneNumber = data.phoneNumber;
    config.accessToken = data.accessToken;
    config.logo = data.logo;
    return config.save();
  }

  async getConfigurationById(id: string): Promise<ProjectConfigurationDocument> {
    const project = await this.projectModel.findById(id);
    if (!project) throw new NotFoundException('Project not found');

    let config = await this.configModel.findOne({ projectId: project._id })
    if (!config) throw new NotFoundException('Project configuration not found');
    return config;
  }

  async getConfigurationByProjectId(projectId: string): Promise<ProjectConfigurationDocument> {
    const config = await this.configModel.findOne({
      projectId: new Types.ObjectId(projectId),
      status: 'active',
    });
    if (!config) throw new NotFoundException('Active project configuration not found');
    return config;
  }

  async getConfigurationByWabaId(wabaId: string): Promise<ProjectConfigurationDocument | null> {
    return this.configModel.findOne({
      whatsappBusinessAccountId: wabaId,
      status: 'active',
    });
  }

  async listConfigurations() {
    return this.configModel.find({ status: 'active' }).sort({ createdAt: -1 }).populate('projectId');
  }

  async deleteConfiguration(id: string) {
    return this.configModel.findByIdAndUpdate(id, { status: 'inactive' });
  }
}
