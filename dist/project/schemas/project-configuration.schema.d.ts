import { Document, Types } from 'mongoose';
export type ProjectConfigurationDocument = ProjectConfiguration & Document;
export declare class ProjectConfiguration {
    projectId: Types.ObjectId;
    whatsappBusinessAccountId: string;
    phoneNumberId: string;
    phoneNumber: string;
    accessToken: string;
    logo: string;
    status: string;
}
export declare const ProjectConfigurationSchema: import("mongoose").Schema<ProjectConfiguration, import("mongoose").Model<ProjectConfiguration, any, any, any, (Document<unknown, any, ProjectConfiguration, any, import("mongoose").DefaultSchemaOptions> & ProjectConfiguration & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ProjectConfiguration, any, import("mongoose").DefaultSchemaOptions> & ProjectConfiguration & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, ProjectConfiguration>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    whatsappBusinessAccountId?: import("mongoose").SchemaDefinitionProperty<string, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phoneNumberId?: import("mongoose").SchemaDefinitionProperty<string, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    phoneNumber?: import("mongoose").SchemaDefinitionProperty<string, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    accessToken?: import("mongoose").SchemaDefinitionProperty<string, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    logo?: import("mongoose").SchemaDefinitionProperty<string, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, ProjectConfiguration, Document<unknown, {}, ProjectConfiguration, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<ProjectConfiguration & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ProjectConfiguration>;
