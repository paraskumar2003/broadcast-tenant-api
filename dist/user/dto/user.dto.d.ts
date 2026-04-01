import { UserRole } from '../schemas/user.schema';
export declare class LoginDto {
    mobile: string;
    password: string;
}
export declare class SendOtpDto {
    mobile: string;
}
export declare class VerifyOtpDto {
    mobile: string;
    otp: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class CreateUserDto {
    name: string;
    mobile: string;
    password: string;
    role: UserRole;
}
export declare class GrantAccessDto {
    userId: string;
    projectId: string;
}
