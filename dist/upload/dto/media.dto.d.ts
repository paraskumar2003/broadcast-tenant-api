export declare class PresignMediaDto {
    projectId: string;
    filename: string;
    contentType: string;
}
export declare class ConfirmMediaDto {
    projectId: string;
    key: string;
    filename: string;
    alt?: string;
    mediaType?: string;
}
export declare class MetaHandleDto {
    projectId: string;
    mediaId?: string;
    url?: string;
}
export declare class UpdateMediaDto {
    alt?: string;
    filename?: string;
    mediaType?: string;
}
