import { Document, Types } from 'mongoose';
export type TagDocument = Tag & Document;
export declare class Tag {
    projectId: Types.ObjectId;
    name: string;
    color: string;
}
export declare const TagSchema: import("mongoose").Schema<Tag, import("mongoose").Model<Tag, any, any, any, (Document<unknown, any, Tag, any, import("mongoose").DefaultSchemaOptions> & Tag & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Tag, any, import("mongoose").DefaultSchemaOptions> & Tag & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Tag>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Tag, Document<unknown, {}, Tag, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Tag & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Tag, Document<unknown, {}, Tag, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tag & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Tag, Document<unknown, {}, Tag, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tag & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    color?: import("mongoose").SchemaDefinitionProperty<string, Tag, Document<unknown, {}, Tag, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Tag & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Tag>;
