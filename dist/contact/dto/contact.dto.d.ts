export declare class CreateContactDto {
    projectId: string;
    name?: string;
    mobile: string;
    tagIds?: string[];
    metadata?: Record<string, any>;
}
export declare class UpdateContactDto {
    name?: string;
    mobile?: string;
    metadata?: Record<string, any>;
    addTagIds?: string[];
    removeTagIds?: string[];
}
export declare class ListContactsQueryDto {
    tagId?: string;
    search?: string;
    active?: boolean;
    page?: number;
    limit?: number;
}
export declare class CsvImportResultDto {
    imported: number;
    skipped: number;
    errors: {
        row: number;
        reason: string;
    }[];
}
