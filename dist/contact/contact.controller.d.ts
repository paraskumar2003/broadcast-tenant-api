import type { Response } from 'express';
import { ContactService } from './contact.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateContactDto, UpdateContactDto, ListContactsQueryDto } from './dto/contact.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    create(dto: CreateContactDto): Promise<ApiResponseDto<import("./schemas/contact.schema").ContactDocument>>;
    tagsSummary(projectId: string): Promise<ApiResponseDto<{
        tagId: import("mongoose").Types.ObjectId;
        name: string;
        color: string;
        contactCount: any;
    }[]>>;
    listByProject(projectId: string, query: ListContactsQueryDto): Promise<ApiResponseDto<{
        data: {
            tags: any[];
            projectId: import("mongoose").Types.ObjectId;
            name: string;
            mobile: string;
            metadata: Record<string, any>;
            isActive: boolean;
            _id: import("mongoose").Types.ObjectId;
            $locals: Record<string, unknown>;
            $op: "save" | "validate" | "remove" | null;
            $where: Record<string, unknown>;
            baseModelName?: string;
            collection: import("mongoose").Collection;
            db: import("mongoose").Connection;
            errors?: import("mongoose").Error.ValidationError;
            isNew: boolean;
            schema: import("mongoose").Schema;
            __v: number;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>>;
    downloadSampleCsv(res: Response): Promise<void>;
    importCsv(file: Express.Multer.File, projectId: string): Promise<ApiResponseDto<import("./dto/contact.dto").CsvImportResultDto>>;
    getById(id: string): Promise<ApiResponseDto<{
        tags: import("mongoose").Types.ObjectId[];
        projectId: import("mongoose").Types.ObjectId;
        name: string;
        mobile: string;
        metadata: Record<string, any>;
        isActive: boolean;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>>;
    update(id: string, dto: UpdateContactDto): Promise<ApiResponseDto<{
        tags: import("mongoose").Types.ObjectId[];
        projectId: import("mongoose").Types.ObjectId;
        name: string;
        mobile: string;
        metadata: Record<string, any>;
        isActive: boolean;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>>;
    delete(id: string): Promise<ApiResponseDto<unknown>>;
    reactivate(id: string): Promise<ApiResponseDto<import("mongoose").Document<unknown, {}, import("./schemas/contact.schema").ContactDocument, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/contact.schema").Contact & import("mongoose").Document<import("mongoose").Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>>;
}
