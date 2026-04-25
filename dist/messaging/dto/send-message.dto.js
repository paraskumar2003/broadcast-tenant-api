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
exports.SendTextDto = exports.SendBulkDto = exports.SendSingleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class SendSingleDto {
    projectConfigId;
    number;
    template;
    params;
    language;
    scheduledAt;
    skipBroadcast;
    broadcastName;
}
exports.SendSingleDto = SendSingleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project configuration ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendSingleDto.prototype, "projectConfigId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendSingleDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template JSON (stringified or object)' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendSingleDto.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Template body parameters' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendSingleDto.prototype, "params", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Language code', default: 'en_US' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendSingleDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Schedule ISO date (null = immediate)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendSingleDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Skip broadcast creation — send as a quick message',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SendSingleDto.prototype, "skipBroadcast", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Broadcast name (auto-generated if empty). Ignored when skipBroadcast is true.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendSingleDto.prototype, "broadcastName", void 0);
class SendBulkDto {
    projectConfigId;
    template;
    recipients;
    tagIds;
    params;
    language;
    scheduledAt;
    skipBroadcast;
    broadcastName;
}
exports.SendBulkDto = SendBulkDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project configuration ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendBulkDto.prototype, "projectConfigId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Template JSON' }),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendBulkDto.prototype, "template", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of recipient objects with number and params',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SendBulkDto.prototype, "recipients", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Array of tag IDs — all active contacts mapped to these tags will be included (deduplicated)',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    __metadata("design:type", Array)
], SendBulkDto.prototype, "tagIds", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Default template parameters applied to all tag-resolved contacts',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], SendBulkDto.prototype, "params", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Language code', default: 'en_US' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendBulkDto.prototype, "language", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Schedule ISO date' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendBulkDto.prototype, "scheduledAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Skip broadcast creation — send as a quick message',
        default: false,
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], SendBulkDto.prototype, "skipBroadcast", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Broadcast name (auto-generated if empty). Ignored when skipBroadcast is true.',
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendBulkDto.prototype, "broadcastName", void 0);
class SendTextDto {
    projectConfigId;
    number;
    text;
}
exports.SendTextDto = SendTextDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Project configuration ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTextDto.prototype, "projectConfigId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Recipient phone number' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTextDto.prototype, "number", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Text message body' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SendTextDto.prototype, "text", void 0);
//# sourceMappingURL=send-message.dto.js.map