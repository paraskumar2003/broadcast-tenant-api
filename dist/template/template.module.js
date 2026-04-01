"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateModule = void 0;
const common_1 = require("@nestjs/common");
const template_service_1 = require("./template.service");
const template_controller_1 = require("./template.controller");
const meta_api_module_1 = require("../meta-api/meta-api.module");
const project_module_1 = require("../project/project.module");
const tagging_module_1 = require("../tagging/tagging.module");
let TemplateModule = class TemplateModule {
};
exports.TemplateModule = TemplateModule;
exports.TemplateModule = TemplateModule = __decorate([
    (0, common_1.Module)({
        imports: [meta_api_module_1.MetaApiModule, project_module_1.ProjectModule, tagging_module_1.TaggingModule],
        providers: [template_service_1.TemplateService],
        controllers: [template_controller_1.TemplateController],
        exports: [template_service_1.TemplateService],
    })
], TemplateModule);
//# sourceMappingURL=template.module.js.map