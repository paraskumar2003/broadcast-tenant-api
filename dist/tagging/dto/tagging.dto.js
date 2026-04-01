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
exports.AttachDetachTagDto = exports.EntityType = exports.UpdateTagDto = exports.CreateTagDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateTagDto {
    projectId;
    name;
    color;
}
exports.CreateTagDto = CreateTagDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec072' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTagDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Marketing' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateTagDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#EF4444' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateTagDto.prototype, "color", void 0);
class UpdateTagDto {
    name;
    color;
}
exports.UpdateTagDto = UpdateTagDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Sale Campaign' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTagDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '#10B981' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTagDto.prototype, "color", void 0);
var EntityType;
(function (EntityType) {
    EntityType["UPLOAD"] = "upload";
    EntityType["TEMPLATE"] = "template";
    EntityType["CONTACT"] = "contact";
})(EntityType || (exports.EntityType = EntityType = {}));
class AttachDetachTagDto {
    projectId;
    tagId;
    entityType;
    entityId;
}
exports.AttachDetachTagDto = AttachDetachTagDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec072' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttachDetachTagDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec099' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttachDetachTagDto.prototype, "tagId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: EntityType, example: EntityType.TEMPLATE }),
    (0, class_validator_1.IsEnum)(EntityType),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttachDetachTagDto.prototype, "entityType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the media/contact or Name of the template', example: 'summer_sale_v1' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AttachDetachTagDto.prototype, "entityId", void 0);
//# sourceMappingURL=tagging.dto.js.map