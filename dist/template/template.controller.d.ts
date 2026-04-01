import { TemplateService } from './template.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { TemplateDto, CreateTemplateDto } from './dto/template.dto';
export declare class TemplateController {
    private readonly templateService;
    constructor(templateService: TemplateService);
    fetchTemplates(body: TemplateDto): Promise<ApiResponseDto<any[]>>;
    fetchTemplateDetail(body: {
        templateId: string;
        projectConfigId: string;
    }): Promise<ApiResponseDto<any>>;
    createTemplate(dto: CreateTemplateDto): Promise<ApiResponseDto<any>>;
}
