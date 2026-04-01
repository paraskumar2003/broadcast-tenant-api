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
exports.MediaSchema = exports.Media = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Media = class Media {
    projectId;
    url;
    key;
    filename;
    contentType;
    size;
    alt;
    mediaType;
    status;
};
exports.Media = Media;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'Project', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Media.prototype, "projectId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "url", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "key", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "filename", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Media.prototype, "contentType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], Media.prototype, "size", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: '' }),
    __metadata("design:type", String)
], Media.prototype, "alt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['image', 'video', 'document', 'other'], default: 'other' }),
    __metadata("design:type", String)
], Media.prototype, "mediaType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: ['active', 'deleted'], default: 'active' }),
    __metadata("design:type", String)
], Media.prototype, "status", void 0);
exports.Media = Media = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Media);
exports.MediaSchema = mongoose_1.SchemaFactory.createForClass(Media);
//# sourceMappingURL=media.schema.js.map