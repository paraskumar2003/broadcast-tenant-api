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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const user_service_1 = require("./user.service");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_schema_1 = require("./schemas/user.schema");
const api_response_dto_1 = require("../common/dto/api-response.dto");
const user_dto_1 = require("./dto/user.dto");
let UserController = class UserController {
    userService;
    constructor(userService) {
        this.userService = userService;
    }
    async create(dto, user) {
        if (user.role === user_schema_1.UserRole.SUPER && dto.role !== user_schema_1.UserRole.EXECUTIVE) {
            return api_response_dto_1.ApiResponseDto.error('Super users can only create executives');
        }
        const data = await this.userService.createUser({
            ...dto,
            createdBy: user.sub,
        });
        return api_response_dto_1.ApiResponseDto.success('User created', {
            id: data._id,
            name: data.name,
            mobile: data.mobile,
            role: data.role,
        });
    }
    async list(user) {
        const data = await this.userService.listUsers({
            sub: user.sub,
            role: user.role,
        });
        return api_response_dto_1.ApiResponseDto.success('Users fetched', data);
    }
    async getById(id) {
        const data = await this.userService.getUserById(id);
        return api_response_dto_1.ApiResponseDto.success('User fetched', data);
    }
    async update(id, body) {
        const data = await this.userService.updateUser(id, body);
        return api_response_dto_1.ApiResponseDto.success('User updated', data);
    }
    async delete(id) {
        await this.userService.deleteUser(id);
        return api_response_dto_1.ApiResponseDto.success('User deleted');
    }
    async grantAccess(dto, user) {
        const data = await this.userService.grantProjectAccess(dto.userId, dto.projectId, user.sub, user.role);
        return api_response_dto_1.ApiResponseDto.success('Access granted', data);
    }
    async revokeAccess(dto) {
        const data = await this.userService.revokeProjectAccess(dto.userId, dto.projectId);
        return api_response_dto_1.ApiResponseDto.success(data.message);
    }
    async listAccess(userId) {
        const data = await this.userService.listUserAccess(userId);
        return api_response_dto_1.ApiResponseDto.success('Access list fetched', data);
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user (Master/Super only)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List users (role-filtered)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Update user (Master/Super only)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (Master only)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)('access/grant'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Grant project access to an executive' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.GrantAccessDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "grantAccess", null);
__decorate([
    (0, common_1.Post)('access/revoke'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke project access from an executive' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.GrantAccessDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "revokeAccess", null);
__decorate([
    (0, common_1.Get)('access/:userId'),
    (0, roles_decorator_1.Roles)(user_schema_1.UserRole.MASTER, user_schema_1.UserRole.SUPER),
    (0, swagger_1.ApiOperation)({ summary: 'List project access grants for a user' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "listAccess", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, transform: true })),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map