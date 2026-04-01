import { ProjectService } from './project.service';
import { UserService } from '../user/user.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { ProjectDto } from './dto/project.dto';
import { ProjectConfigurationDto } from './dto/project-configuration.dto';
export declare class ProjectController {
    private readonly projectService;
    private readonly userService;
    constructor(projectService: ProjectService, userService: UserService);
    create(body: ProjectDto, user: any): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/project.schema").ProjectDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
    list(user: any): Promise<ApiResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/project.schema").ProjectDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project.schema").Project & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>>;
    delete(id: string): Promise<ApiResponseDto<unknown>>;
    createConfig(body: ProjectConfigurationDto): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/project-configuration.schema").ProjectConfigurationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project-configuration.schema").ProjectConfiguration & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
    listConfigs(): Promise<ApiResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/project-configuration.schema").ProjectConfigurationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project-configuration.schema").ProjectConfiguration & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>>;
    getConfig(projectId: string): Promise<ApiResponseDto<import("./schemas/project-configuration.schema").ProjectConfigurationDocument>>;
    updateConfig(id: string, body: ProjectConfigurationDto): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/project-configuration.schema").ProjectConfigurationDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/project-configuration.schema").ProjectConfiguration & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
    deleteConfig(id: string): Promise<ApiResponseDto<unknown>>;
}
