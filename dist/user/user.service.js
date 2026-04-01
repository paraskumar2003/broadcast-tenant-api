"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = __importStar(require("bcrypt"));
const user_schema_1 = require("./schemas/user.schema");
const user_project_access_schema_1 = require("./schemas/user-project-access.schema");
let UserService = class UserService {
    userModel;
    accessModel;
    constructor(userModel, accessModel) {
        this.userModel = userModel;
        this.accessModel = accessModel;
    }
    async createUser(data) {
        const existing = await this.userModel.findOne({
            mobile: data.mobile,
            status: 'active',
        });
        if (existing) {
            throw new common_1.BadRequestException('User with this mobile already exists');
        }
        const hashedPassword = await bcrypt.hash(data.password, 10);
        return this.userModel.create({
            name: data.name,
            mobile: data.mobile,
            password: hashedPassword,
            role: data.role,
            createdBy: data.createdBy ? new mongoose_2.Types.ObjectId(data.createdBy) : null,
        });
    }
    async listUsers(requestingUser) {
        if (requestingUser.role === user_schema_1.UserRole.MASTER) {
            return this.userModel
                .find({ status: 'active' })
                .select('-password')
                .sort({ createdAt: -1 });
        }
        if (requestingUser.role === user_schema_1.UserRole.SUPER) {
            return this.userModel
                .find({
                status: 'active',
                $or: [
                    { _id: new mongoose_2.Types.ObjectId(requestingUser.sub) },
                    { createdBy: new mongoose_2.Types.ObjectId(requestingUser.sub) },
                ],
            })
                .select('-password')
                .sort({ createdAt: -1 });
        }
        return this.userModel
            .find({ _id: new mongoose_2.Types.ObjectId(requestingUser.sub), status: 'active' })
            .select('-password');
    }
    async getUserById(id) {
        const user = await this.userModel.findById(id).select('-password');
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateUser(id, data) {
        return this.userModel.findByIdAndUpdate(id, data, { new: true }).select('-password');
    }
    async deleteUser(id) {
        return this.userModel.findByIdAndUpdate(id, { status: 'inactive' }, { new: true });
    }
    async grantProjectAccess(userId, projectId, grantedBy, grantorRole) {
        const targetUser = await this.userModel.findById(userId);
        if (!targetUser)
            throw new common_1.NotFoundException('User not found');
        if (targetUser.role !== user_schema_1.UserRole.EXECUTIVE) {
            throw new common_1.BadRequestException('Project access can only be granted to executives');
        }
        const existing = await this.accessModel.findOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            projectId: new mongoose_2.Types.ObjectId(projectId),
        });
        if (existing) {
            throw new common_1.BadRequestException('Access already granted for this project');
        }
        return this.accessModel.create({
            userId: new mongoose_2.Types.ObjectId(userId),
            projectId: new mongoose_2.Types.ObjectId(projectId),
            grantedBy: new mongoose_2.Types.ObjectId(grantedBy),
        });
    }
    async revokeProjectAccess(userId, projectId) {
        const result = await this.accessModel.deleteOne({
            userId: new mongoose_2.Types.ObjectId(userId),
            projectId: new mongoose_2.Types.ObjectId(projectId),
        });
        if (result.deletedCount === 0) {
            throw new common_1.NotFoundException('Access grant not found');
        }
        return { message: 'Access revoked' };
    }
    async getAccessibleProjectIds(userId) {
        const grants = await this.accessModel.find({
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        return grants.map((g) => g.projectId);
    }
    async listUserAccess(userId) {
        return this.accessModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .populate('projectId')
            .populate('grantedBy', 'name mobile role');
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(user_project_access_schema_1.UserProjectAccess.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], UserService);
//# sourceMappingURL=user.service.js.map