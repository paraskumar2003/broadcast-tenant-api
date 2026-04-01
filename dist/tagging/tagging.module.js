"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaggingModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const tagging_service_1 = require("./tagging.service");
const tagging_controller_1 = require("./tagging.controller");
const tag_schema_1 = require("./schemas/tag.schema");
const upload_tagging_schema_1 = require("./schemas/upload-tagging.schema");
const template_tagging_schema_1 = require("./schemas/template-tagging.schema");
const contact_tagging_schema_1 = require("./schemas/contact-tagging.schema");
let TaggingModule = class TaggingModule {
};
exports.TaggingModule = TaggingModule;
exports.TaggingModule = TaggingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: tag_schema_1.Tag.name, schema: tag_schema_1.TagSchema },
                { name: upload_tagging_schema_1.UploadTagging.name, schema: upload_tagging_schema_1.UploadTaggingSchema },
                { name: template_tagging_schema_1.TemplateTagging.name, schema: template_tagging_schema_1.TemplateTaggingSchema },
                { name: contact_tagging_schema_1.ContactTagging.name, schema: contact_tagging_schema_1.ContactTaggingSchema },
            ]),
        ],
        providers: [tagging_service_1.TaggingService],
        controllers: [tagging_controller_1.TaggingController],
        exports: [tagging_service_1.TaggingService],
    })
], TaggingModule);
//# sourceMappingURL=tagging.module.js.map