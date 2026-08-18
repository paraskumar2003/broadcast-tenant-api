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
exports.UpdateMediaDto = exports.MetaHandleDto = exports.ConfirmMediaDto = exports.PresignMediaDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PresignMediaDto {
    projectId;
    filename;
    contentType;
}
exports.PresignMediaDto = PresignMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec072' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PresignMediaDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'campaign-banner.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PresignMediaDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'image/jpeg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PresignMediaDto.prototype, "contentType", void 0);
class ConfirmMediaDto {
    projectId;
    key;
    filename;
    alt;
    mediaType;
}
exports.ConfirmMediaDto = ConfirmMediaDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec072' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmMediaDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'whatsapp-service/development/uploads/0f734bec-...jpeg',
        description: 'The S3 key returned by /media/presign, after the file has been PUT there.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmMediaDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'campaign-banner.jpg' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ConfirmMediaDto.prototype, "filename", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Banner image for campaign' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfirmMediaDto.prototype, "alt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['image', 'video', 'document', 'other'], example: 'image' }),
    (0, class_validator_1.IsEnum)(['image', 'video', 'document', 'other']),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], ConfirmMediaDto.prototype, "mediaType", void 0);
class MetaHandleDto {
    projectId;
    mediaId;
    url;
}
exports.MetaHandleDto = MetaHandleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec072' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], MetaHandleDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '6482c4adda0e29b69bfec099',
        description: 'A media gallery item to convert. Provide this or `url`.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetaHandleDto.prototype, "mediaId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'https://example.com/some-image.jpg',
        description: 'A direct media URL to convert. Provide this or `mediaId`.',
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], MetaHandleDto.prototype, "url", void 0);
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