export declare class CreateTagDto {
    projectId: string;
    name: string;
    color?: string;
}
export declare class UpdateTagDto {
    name?: string;
    color?: string;
}
export declare enum EntityType {
    UPLOAD = "upload",
    TEMPLATE = "template",
    CONTACT = "contact"
}
export declare class AttachDetachTagDto {
    projectId: string;
    tagId: string;
    entityType: EntityType;
    entityId: string;
}
