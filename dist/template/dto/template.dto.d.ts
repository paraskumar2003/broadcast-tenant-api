export declare class TemplateDto {
    projectId: string;
}
export declare class CreateTemplateDto {
    projectId: string;
    name: string;
    language: string;
    category: string;
    components: any[];
    allow_category_change?: boolean;
}
