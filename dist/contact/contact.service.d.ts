import { Model, Types } from 'mongoose';
import { Contact, ContactDocument } from './schemas/contact.schema';
import { ContactTaggingDocument } from '../tagging/schemas/contact-tagging.schema';
import { TagDocument } from '../tagging/schemas/tag.schema';
import { CreateContactDto, UpdateContactDto, ListContactsQueryDto, CsvImportResultDto } from './dto/contact.dto';
export declare class ContactService {
    private readonly contactModel;
    private readonly contactTaggingModel;
    private readonly tagModel;
    constructor(contactModel: Model<ContactDocument>, contactTaggingModel: Model<ContactTaggingDocument>, tagModel: Model<TagDocument>);
    getTagsSummary(projectId: string): Promise<{
        tagId: Types.ObjectId;
        name: string;
        color: string;
        contactCount: any;
    }[]>;
    create(dto: CreateContactDto): Promise<ContactDocument>;
    findByProject(projectId: string, query: ListContactsQueryDto): Promise<{
        data: {
            tags: any[];
            projectId: Types.ObjectId;
            name: string;
            mobile: string;
            metadata: Record<string, any>;
            isActive: boolean;
            _id: Types.ObjectId;
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
    }>;
    findById(id: string): Promise<{
        tags: Types.ObjectId[];
        projectId: Types.ObjectId;
        name: string;
        mobile: string;
        metadata: Record<string, any>;
        isActive: boolean;
        _id: Types.ObjectId;
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
    }>;
    update(id: string, dto: UpdateContactDto): Promise<{
        tags: Types.ObjectId[];
        projectId: Types.ObjectId;
        name: string;
        mobile: string;
        metadata: Record<string, any>;
        isActive: boolean;
        _id: Types.ObjectId;
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
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    reactivate(id: string): Promise<{
        message: string;
        contact: import("mongoose").Document<unknown, {}, ContactDocument, {}, import("mongoose").DefaultSchemaOptions> & Contact & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
            _id: Types.ObjectId;
        }> & {
            __v: number;
        } & {
            id: string;
        };
    }>;
    importFromCsv(projectId: string, fileBuffer: Buffer): Promise<CsvImportResultDto>;
    getSampleCsvBuffer(): Buffer;
    private attachTagsToContact;
    private extractMetadata;
}
