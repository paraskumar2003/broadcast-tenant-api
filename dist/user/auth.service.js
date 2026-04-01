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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcrypt"));
const jwt = __importStar(require("jsonwebtoken"));
const user_schema_1 = require("./schemas/user.schema");
const refresh_token_schema_1 = require("./schemas/refresh-token.schema");
let AuthService = AuthService_1 = class AuthService {
    userModel;
    refreshTokenModel;
    configService;
    logger = new common_1.Logger(AuthService_1.name);
    otpStore = new Map();
    constructor(userModel, refreshTokenModel, configService) {
        this.userModel = userModel;
        this.refreshTokenModel = refreshTokenModel;
        this.configService = configService;
    }
    async loginWithPassword(mobile, password) {
        const user = await this.userModel.findOne({ mobile, status: 'active' });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid mobile number or password');
        }
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid mobile number or password');
        }
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async sendOtp(mobile) {
        const user = await this.userModel.findOne({ mobile, status: 'active' });
        if (!user) {
            throw new common_1.BadRequestException('No active user found with this mobile number');
        }
        const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        this.otpStore.set(mobile, { otp, expiresAt });
        this.logger.log(`OTP for ${mobile}: ${otp} (dev mode)`);
        return { message: 'OTP sent successfully' };
    }
    async verifyOtp(mobile, otp) {
        const stored = this.otpStore.get(mobile);
        if (!stored) {
            throw new common_1.UnauthorizedException('No OTP found. Please request a new one');
        }
        if (Date.now() > stored.expiresAt) {
            this.otpStore.delete(mobile);
            throw new common_1.UnauthorizedException('OTP has expired. Please request a new one');
        }
        if (stored.otp !== otp) {
            throw new common_1.UnauthorizedException('Invalid OTP');
        }
        this.otpStore.delete(mobile);
        const user = await this.userModel.findOne({ mobile, status: 'active' });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async refreshAccessToken(refreshToken) {
        let payload;
        try {
            payload = jwt.verify(refreshToken, this.configService.get('jwt.refreshSecret'));
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired refresh token');
        }
        if (payload.type !== 'refresh') {
            throw new common_1.UnauthorizedException('Invalid token type');
        }
        const storedToken = await this.refreshTokenModel.findOne({
            userId: new mongoose_2.Types.ObjectId(payload.sub),
            isRevoked: false,
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Refresh token has been revoked');
        }
        const isValid = await bcrypt.compare(refreshToken.slice(-20), storedToken.token);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        await this.refreshTokenModel.updateOne({ _id: storedToken._id }, { isRevoked: true });
        const user = await this.userModel.findById(payload.sub);
        if (!user || user.status !== 'active') {
            throw new common_1.UnauthorizedException('User account is inactive');
        }
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async logout(userId) {
        await this.refreshTokenModel.updateMany({ userId: new mongoose_2.Types.ObjectId(userId), isRevoked: false }, { isRevoked: true });
        return { message: 'Logged out successfully' };
    }
    async generateTokens(user) {
        const accessPayload = {
            sub: user._id.toString(),
            mobile: user.mobile,
            role: user.role,
            name: user.name,
            type: 'access',
        };
        const refreshPayload = {
            sub: user._id.toString(),
            mobile: user.mobile,
            role: user.role,
            name: user.name,
            type: 'refresh',
        };
        const accessToken = jwt.sign(accessPayload, this.configService.get('jwt.secret'), { expiresIn: this.configService.get('jwt.accessExpiry') || 900 });
        const refreshToken = jwt.sign(refreshPayload, this.configService.get('jwt.refreshSecret'), { expiresIn: this.configService.get('jwt.refreshExpiry') || 604800 });
        const tokenHash = await this.hashToken(refreshToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.refreshTokenModel.create({
            userId: user._id,
            token: tokenHash,
            expiresAt,
        });
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        return {
            id: user._id.toString(),
            name: user.name,
            mobile: user.mobile,
            role: user.role,
            status: user.status,
        };
    }
    async hashToken(token) {
        return bcrypt.hash(token.slice(-20), 4);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __param(1, (0, mongoose_1.InjectModel)(refresh_token_schema_1.RefreshToken.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map