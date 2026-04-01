import { Document, Types } from 'mongoose';
export type MediaDocument = Media & Document;
export declare class Media {
    projectId: Types.ObjectId;
    url: string;
    key: string;
    filename: string;
    contentType: string;
    size: number;
    alt: string;
    mediaType: string;
    status: string;
}
export declare const MediaSchema: import("mongoose").Schema<Media, import("mongoose").Model<Media, any, any, any, (Document<unknown, any, Media, any, import("mongoose").DefaultSchemaOptions> & Media & {
    _id: Types.ObjectId;
} & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Media, any, import("mongoose").DefaultSchemaOptions> & Media & {
    _id: Types.ObjectId;
} & {
    __v: number;
}), any, Media>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Media, Document<unknown, {}, Media, {
    id: string;
}, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    projectId?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    url?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    key?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    filename?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    contentType?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    size?: import("mongoose").SchemaDefinitionProperty<number, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    alt?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    mediaType?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    status?: import("mongoose").SchemaDefinitionProperty<string, Media, Document<unknown, {}, Media, {
        id: string;
    }, import("mongoose").DefaultSchemaOptions> & Omit<Media & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Media>;
