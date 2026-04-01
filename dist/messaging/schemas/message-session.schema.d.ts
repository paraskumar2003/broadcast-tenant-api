import { Document, Types } from 'mongoose';
export type MessageSessionDocument = MessageSession & Document;
export declare class MessageSession {
    projectConfigId: Types.ObjectId;
    templateName: string;
    templatePayload: Record<string, any>;
    language: string;
    totalRecipients: number;
    counters: {
        queued: number;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
    };
    status: string;
    scheduledAt: Date | null;
    completedAt: Date | null;
}
export declare const MessageSessionSchema: import("mongoose").Schema<MessageSession, import("mongoose").Model<MessageSession, any, any, any, (Document<unknown, any, MessageSession, any, import("mongoose").DefaultSchemaOptions> & MessageSession & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, MessageSession, any, import("mongoose").DefaultSchemaOptions> & MessageSession & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, MessageSession>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, MessageSession, Document<unknown, {}, MessageSession, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectConfigId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    templateName?: import("mongoose").SchemaDefinitionProperty<string, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    templatePayload?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    language?: import("mongoose").SchemaDefinitionProperty<string, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    totalRecipients?: import("mongoose").SchemaDefinitionProperty<number, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    counters?: import("mongoose").SchemaDefinitionProperty<{
        queued: number;
        sent: number;
        delivered: number;
        read: number;
        failed: number;
    }, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    scheduledAt?: import("mongoose").SchemaDefinitionProperty<Date | null, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    completedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, MessageSession, Document<unknown, {}, MessageSession, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<MessageSession & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, MessageSession>;
