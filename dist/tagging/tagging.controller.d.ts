import { TaggingService } from './tagging.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateTagDto, UpdateTagDto, AttachDetachTagDto, EntityType } from './dto/tagging.dto';
export declare class TaggingController {
    private readonly taggingService;
    constructor(taggingService: TaggingService);
    createTag(dto: CreateTagDto): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/tag.schema").TagDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/tag.schema").Tag & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
    listTags(projectId: string): Promise<ApiResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/tag.schema").TagDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/tag.schema").Tag & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>>;
    updateTag(id: string, dto: UpdateTagDto): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/tag.schema").TagDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/tag.schema").Tag & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
    deleteTag(id: string): Promise<ApiResponseDto<unknown>>;
    attachTag(dto: AttachDetachTagDto): Promise<ApiResponseDto<unknown>>;
    detachTag(dto: AttachDetachTagDto): Promise<ApiResponseDto<unknown>>;
    getEntityTags(projectId: string, entityType: EntityType, entityId: string): Promise<ApiResponseDto<(import("mongoose").Document<unknown, {}, import("./schemas/tag.schema").TagDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/tag.schema").Tag & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>>;
}
