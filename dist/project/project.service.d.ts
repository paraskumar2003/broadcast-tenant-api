import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/project.schema';
import { ProjectConfiguration, ProjectConfigurationDocument } from './schemas/project-configuration.schema';
import { UserRole } from '../user/schemas/user.schema';
import { ProjectConfigurationDto } from './dto/project-configuration.dto';
export declare class ProjectService {
    private readonly projectModel;
    private readonly configModel;
    constructor(projectModel: Model<ProjectDocument>, configModel: Model<ProjectConfigurationDocument>);
    createProject(name: string, slug: string, createdBy?: string): Promise<import("mongoose").Document<unknown, {}, ProjectDocument, {}, import("mongoose").DefaultSchemaOptions> & Project & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    listProjectsForUser(user: {
        sub: string;
        role: UserRole;
        accessibleProjectIds?: Types.ObjectId[];
    }): Promise<(import("mongoose").Document<unknown, {}, ProjectDocument, {}, import("mongoose").DefaultSchemaOptions> & Project & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    deleteProject(id: string): Promise<(import("mongoose").Document<unknown, {}, ProjectDocument, {}, import("mongoose").DefaultSchemaOptions> & Project & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    createConfiguration(data: ProjectConfigurationDto): Promise<import("mongoose").Document<unknown, {}, ProjectConfigurationDocument, {}, import("mongoose").DefaultSchemaOptions> & ProjectConfiguration & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateConfiguration(id: string, data: ProjectConfigurationDto): Promise<import("mongoose").Document<unknown, {}, ProjectConfigurationDocument, {}, import("mongoose").DefaultSchemaOptions> & ProjectConfiguration & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getConfigurationById(id: string): Promise<ProjectConfigurationDocument>;
    getConfigurationByProjectId(projectId: string): Promise<ProjectConfigurationDocument>;
    getConfigurationByWabaId(wabaId: string): Promise<ProjectConfigurationDocument | null>;
    listConfigurations(): Promise<(import("mongoose").Document<unknown, {}, ProjectConfigurationDocument, {}, import("mongoose").DefaultSchemaOptions> & ProjectConfiguration & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    deleteConfiguration(id: string): Promise<(import("mongoose").Document<unknown, {}, ProjectConfigurationDocument, {}, import("mongoose").DefaultSchemaOptions> & ProjectConfiguration & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
}
