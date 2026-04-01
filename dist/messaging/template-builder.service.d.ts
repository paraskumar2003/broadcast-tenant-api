import { TemplateComponent } from '../meta-api/meta-api.service';
export declare class TemplateBuilderService {
    private readonly logger;
    buildComponents(templateComponents: any[], params: Record<string, any>): TemplateComponent[];
    private buildHeader;
    private buildBody;
    private buildCarousel;
    private buildButtons;
}
