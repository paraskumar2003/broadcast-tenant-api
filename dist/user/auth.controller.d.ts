import { AuthService } from './auth.service';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { LoginDto, SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/user.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<ApiResponseDto<{
        user: {
            id: string;
            name: string;
            mobile: string;
            role: import("./schemas/user.schema").UserRole;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>>;
    sendOtp(dto: SendOtpDto): Promise<ApiResponseDto<unknown>>;
    verifyOtp(dto: VerifyOtpDto): Promise<ApiResponseDto<{
        user: {
            id: string;
            name: string;
            mobile: string;
            role: import("./schemas/user.schema").UserRole;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>>;
    refresh(dto: RefreshTokenDto): Promise<ApiResponseDto<{
        user: {
            id: string;
            name: string;
            mobile: string;
            role: import("./schemas/user.schema").UserRole;
            status: string;
        };
        accessToken: string;
        refreshToken: string;
    }>>;
    logout(userId: string): Promise<ApiResponseDto<unknown>>;
}
