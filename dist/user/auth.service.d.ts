import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { UserDocument, UserRole } from './schemas/user.schema';
import { RefreshTokenDocument } from './schemas/refresh-token.schema';
export declare class AuthService {
    private userModel;
    private refreshTokenModel;
    private readonly configService;
    private readonly logger;
    private readonly otpStore;
    constructor(userModel: Model<UserDocument>, refreshTokenModel: Model<RefreshTokenDocument>, configService: ConfigService);
    loginWithPassword(mobile: string, password: string): Promise<{
        user: {
            id: string;
            name: string;
            mobile: string;
            role: UserRole;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    sendOtp(mobile: string): Promise<{
        message: string;
    }>;
    verifyOtp(mobile: string, otp: string): Promise<{
        user: {
            id: string;
            name: string;
            mobile: string;
            role: UserRole;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshAccessToken(refreshToken: string): Promise<{
        user: {
            id: string;
            name: string;
            mobile: string;
            role: UserRole;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    private generateTokens;
    private sanitizeUser;
    private hashToken;
}
