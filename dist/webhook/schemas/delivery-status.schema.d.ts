import { Document } from 'mongoose';
export type DeliveryStatusDocument = DeliveryStatus & Document;
export declare class DeliveryStatus {
    wabaId: string;
    metaMessageId: string;
    recipientNumber: string;
    status: string;
    errorCode: number | null;
    errorTitle: string | null;
    timestamp: Date;
    rawPayload: Record<string, any>;
}
export declare const DeliveryStatusSchema: import("mongoose").Schema<DeliveryStatus, import("mongoose").Model<DeliveryStatus, any, any, any, (Document<unknown, any, DeliveryStatus, any, import("mongoose").DefaultSchemaOptions> & DeliveryStatus & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, DeliveryStatus, any, import("mongoose").DefaultSchemaOptions> & DeliveryStatus & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}), any, DeliveryStatus>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    wabaId?: import("mongoose").SchemaDefinitionProperty<string, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    metaMessageId?: import("mongoose").SchemaDefinitionProperty<string, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    recipientNumber?: import("mongoose").SchemaDefinitionProperty<string, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    errorCode?: import("mongoose").SchemaDefinitionProperty<number | null, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    errorTitle?: import("mongoose").SchemaDefinitionProperty<string | null, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    timestamp?: import("mongoose").SchemaDefinitionProperty<Date, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    rawPayload?: import("mongoose").SchemaDefinitionProperty<Record<string, any>, DeliveryStatus, Document<unknown, {}, DeliveryStatus, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<DeliveryStatus & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, DeliveryStatus>;
