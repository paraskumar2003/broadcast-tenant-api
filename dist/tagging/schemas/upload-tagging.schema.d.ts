import { Document, Types } from 'mongoose';
export type UploadTaggingDocument = UploadTagging & Document;
export declare class UploadTagging {
    projectId: Types.ObjectId;
    tagId: Types.ObjectId;
    uploadId: Types.ObjectId;
}
export declare const UploadTaggingSchema: import("mongoose").Schema<UploadTagging, import("mongoose").Model<UploadTagging, any, any, any, (Document<unknown, any, UploadTagging, any, import("mongoose").DefaultSchemaOptions> & UploadTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, UploadTagging, any, import("mongoose").DefaultSchemaOptions> & UploadTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, UploadTagging>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UploadTagging, Document<unknown, {}, UploadTagging, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<UploadTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, UploadTagging, Document<unknown, {}, UploadTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<UploadTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tagId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, UploadTagging, Document<unknown, {}, UploadTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<UploadTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    uploadId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, UploadTagging, Document<unknown, {}, UploadTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<UploadTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, UploadTagging>;
