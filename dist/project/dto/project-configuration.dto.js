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
exports.ProjectConfigurationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ProjectConfigurationDto {
    projectId;
    whatsappBusinessAccountId;
    phoneNumberId;
    phoneNumber;
    accessToken;
    logo;
}
exports.ProjectConfigurationDto = ProjectConfigurationDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '6482c4adda0e29b69bfec072' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectConfigurationDto.prototype, "projectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10119541635XXXX' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectConfigurationDto.prototype, "whatsappBusinessAccountId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '10119541635XXXX' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectConfigurationDto.prototype, "phoneNumberId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '9199999999' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectConfigurationDto.prototype, "phoneNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'EAAV6N3zZAtGUBAN5z9LrJ0FrZ....' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectConfigurationDto.prototype, "accessToken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'https://example.com/logo.png' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], ProjectConfigurationDto.prototype, "logo", void 0);
//# sourceMappingURL=project-configuration.dto.js.map