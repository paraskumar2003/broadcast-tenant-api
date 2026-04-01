"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateTaggingSchema = exports.TemplateTagging = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let TemplateTagging = class TemplateTagging {
    projectId;
    tagId;
    templateName;
};
exports.TemplateTagging = TemplateTagging;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Project', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TemplateTagging.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Tag', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], TemplateTagging.prototype, "tagId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, index: true }),
    __metadata("design:type", String)
], TemplateTagging.prototype, "templateName", void 0);
exports.TemplateTagging = TemplateTagging = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'template_taggings' })
], TemplateTagging);
exports.TemplateTaggingSchema = mongoose_1.SchemaFactory.createForClass(TemplateTagging);
exports.TemplateTaggingSchema.index({ tagId: 1, templateName: 1 }, { unique: true });
//# sourceMappingURL=template-tagging.schema.js.map