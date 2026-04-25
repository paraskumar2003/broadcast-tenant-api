import { Document, Types } from 'mongoose';
export type BroadcastDocument = Broadcast & Document;
export declare class Broadcast {
    projectConfigId: Types.ObjectId;
    name: string;
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
export declare const BroadcastSchema: import("mongoose").Schema<Broadcast, import("mongoose").Model<Broadcast, any, any, any, (Document<unknown, any, Broadcast, any, import("mongoose").DefaultSchemaOptions> & Broadcast & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Broadcast, any, import("mongoose").DefaultSchemaOptions> & Broadcast & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Broadcast>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Broadcast, Document<unknown, {}, Broadcast, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectConfigId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    name?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    templateName?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    templatePayload?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    language?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    totalRecipients?: import("mongoose").SchemaDefinitionProperty<number, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
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
    }, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    scheduledAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    completedAt?: import("mongoose").SchemaDefinitionProperty<Date | null, Broadcast, Document<unknown, {}, Broadcast, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Broadcast & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Broadcast>;
