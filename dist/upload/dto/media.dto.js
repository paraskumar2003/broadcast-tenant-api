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
exports.UpdateMediaDto = exports.CreateMediaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateMediaDto {
    projectId;
    alt;
    mediaType;
}
exports.CreateMediaDto = CreateMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec072' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Banner image for campaign' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "alt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['image', 'video', 'document', 'other'], example: 'image' }),
    (0, class_validator_1.IsEnum)(['image', 'video', 'document', 'other']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateMediaDto.prototype, "mediaType", void 0);
class UpdateMediaDto {
    alt;
    filename;
    mediaType;
}
exports.UpdateMediaDto = UpdateMediaDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Updated alt text' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "alt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'New filename' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['image', 'video', 'document', 'other'], example: 'image' }),
    (0, class_validator_1.IsEnum)(['image', 'video', 'document', 'other']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateMediaDto.prototype, "mediaType", void 0);
//# sourceMappingURL=media.dto.js.map