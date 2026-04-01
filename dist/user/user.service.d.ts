import { Model, Types } from 'mongoose';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { UserProjectAccess, UserProjectAccessDocument } from './schemas/user-project-access.schema';
export declare class UserService {
    private userModel;
    private accessModel;
    constructor(userModel: Model<UserDocument>, accessModel: Model<UserProjectAccessDocument>);
    createUser(data: {
        name: string;
        mobile: string;
        password: string;
        role: UserRole;
        createdBy?: string;
    }): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    listUsers(requestingUser: {
        sub: string;
        role: UserRole;
    }): Promise<(import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    getUserById(id: string): Promise<import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    updateUser(id: string, data: Partial<{
        name: string;
        status: string;
    }>): Promise<(import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    deleteUser(id: string): Promise<(import("mongoose").Document<unknown, {}, UserDocument, {}, import("mongoose").DefaultSchemaOptions> & User & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }) | null>;
    grantProjectAccess(userId: string, projectId: string, grantedBy: string, grantorRole: UserRole): Promise<import("mongoose").Document<unknown, {}, UserProjectAccessDocument, {}, import("mongoose").DefaultSchemaOptions> & UserProjectAccess & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    revokeProjectAccess(userId: string, projectId: string): Promise<{
        message: string;
    }>;
    getAccessibleProjectIds(userId: string): Promise<Types.ObjectId[]>;
    listUserAccess(userId: string): Promise<(import("mongoose").Document<unknown, {}, UserProjectAccessDocument, {}, import("mongoose").DefaultSchemaOptions> & UserProjectAccess & import("mongoose").Document<Types.ObjectId, any, any, Record<string, any>, {}> & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
}
