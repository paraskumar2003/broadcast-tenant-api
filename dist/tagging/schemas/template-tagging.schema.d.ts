import { Document, Types } from 'mongoose';
export type TemplateTaggingDocument = TemplateTagging & Document;
export declare class TemplateTagging {
    projectId: Types.ObjectId;
    tagId: Types.ObjectId;
    templateName: string;
}
export declare const TemplateTaggingSchema: import("mongoose").Schema<TemplateTagging, import("mongoose").Model<TemplateTagging, any, any, any, (Document<unknown, any, TemplateTagging, any, import("mongoose").DefaultSchemaOptions> & TemplateTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, TemplateTagging, any, import("mongoose").DefaultSchemaOptions> & TemplateTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, TemplateTagging>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, TemplateTagging, Document<unknown, {}, TemplateTagging, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<TemplateTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, TemplateTagging, Document<unknown, {}, TemplateTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TemplateTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tagId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, TemplateTagging, Document<unknown, {}, TemplateTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TemplateTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    templateName?: import("mongoose").SchemaDefinitionProperty<string, TemplateTagging, Document<unknown, {}, TemplateTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<TemplateTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, TemplateTagging>;
