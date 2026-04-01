import { Document, Types } from 'mongoose';
export type ContactTaggingDocument = ContactTagging & Document;
export declare class ContactTagging {
    projectId: Types.ObjectId;
    tagId: Types.ObjectId;
    contactId: Types.ObjectId;
}
export declare const ContactTaggingSchema: import("mongoose").Schema<ContactTagging, import("mongoose").Model<ContactTagging, any, any, any, (Document<unknown, any, ContactTagging, any, import("mongoose").DefaultSchemaOptions> & ContactTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ContactTagging, any, import("mongoose").DefaultSchemaOptions> & ContactTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ContactTagging>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ContactTagging, Document<unknown, {}, ContactTagging, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ContactTagging & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ContactTagging, Document<unknown, {}, ContactTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    tagId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ContactTagging, Document<unknown, {}, ContactTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    contactId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ContactTagging, Document<unknown, {}, ContactTagging, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ContactTagging & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ContactTagging>;
