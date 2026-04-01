import { Document, Types } from 'mongoose';
export type UserProjectAccessDocument = UserProjectAccess & Document;
export declare class UserProjectAccess {
    userId: Types.ObjectId;
    projectId: Types.ObjectId;
    grantedBy: Types.ObjectId;
}
export declare const UserProjectAccessSchema: import("mongoose").Schema<UserProjectAccess, import("mongoose").Model<UserProjectAccess, any, any, any, (Document<unknown, any, UserProjectAccess, any, import("mongoose").DefaultSchemaOptions> & UserProjectAccess & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, UserProjectAccess, any, import("mongoose").DefaultSchemaOptions> & UserProjectAccess & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, UserProjectAccess>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, UserProjectAccess, Document<unknown, {}, UserProjectAccess, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<UserProjectAccess & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    userId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, UserProjectAccess, Document<unknown, {}, UserProjectAccess, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<UserProjectAccess & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, UserProjectAccess, Document<unknown, {}, UserProjectAccess, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<UserProjectAccess & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    grantedBy?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, UserProjectAccess, Document<unknown, {}, UserProjectAccess, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<UserProjectAccess & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, UserProjectAccess>;
