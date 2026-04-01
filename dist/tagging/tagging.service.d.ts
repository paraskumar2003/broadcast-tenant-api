import { Model, Types } from 'mongoose';
import { Tag, TagDocument } from './schemas/tag.schema';
import { UploadTagging, UploadTaggingDocument } from './schemas/upload-tagging.schema';
import { TemplateTagging, TemplateTaggingDocument } from './schemas/template-tagging.schema';
import { ContactTagging, ContactTaggingDocument } from './schemas/contact-tagging.schema';
import { CreateTagDto, UpdateTagDto, AttachDetachTagDto, EntityType } from './dto/tagging.dto';
export declare class TaggingService {
    private tagModel;
    private uploadTaggingModel;
    private templateTaggingModel;
    private contactTaggingModel;
    constructor(tagModel: Model<TagDocument>, uploadTaggingModel: Model<UploadTaggingDocument>, templateTaggingModel: Model<TemplateTaggingDocument>, contactTaggingModel: Model<ContactTaggingDocument>);
    createTag(dto: CreateTagDto): Promise<import("mongoose").Document<unknown, {}, TagDocument, {}, import("mongoose").DefaultSchemaOptions> & Tag & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    listTagsByProject(projectId: string): Promise<(import("mongoose").Document<unknown, {}, TagDocument, {}, import("mongoose").DefaultSchemaOptions> & Tag & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    updateTag(tagId: string, dto: UpdateTagDto): Promise<import("mongoose").Document<unknown, {}, TagDocument, {}, import("mongoose").DefaultSchemaOptions> & Tag & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    deleteTag(tagId: string): Promise<{
        message: string;
    }>;
    attachTag(dto: AttachDetachTagDto): Promise<{
        status: boolean;
        message: string;
    }>;
    detachTag(dto: AttachDetachTagDto): Promise<{
        status: boolean;
        message: string;
    }>;
    getTagsForEntity(projectId: string, entityType: EntityType, entityId: string): Promise<(import("mongoose").Document<unknown, {}, TagDocument, {}, import("mongoose").DefaultSchemaOptions> & Tag & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getEntitiesForTag(tagId: string, entityType: EntityType): Promise<(import("mongoose").Document<unknown, {}, UploadTaggingDocument, {}, import("mongoose").DefaultSchemaOptions> & UploadTagging & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[] | (import("mongoose").Document<unknown, {}, TemplateTaggingDocument, {}, import("mongoose").DefaultSchemaOptions> & TemplateTagging & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[] | (import("mongoose").Document<unknown, {}, ContactTaggingDocument, {}, import("mongoose").DefaultSchemaOptions> & ContactTagging & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getTagsForProjectEntities(projectId: string, entityType: EntityType): Promise<Record<string, any[]>>;
}
