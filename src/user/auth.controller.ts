import {
  Controller,
  Post,
  Body,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { LoginDto, SendOtpDto, VerifyOtpDto, RefreshTokenDto } from './dto/user.dto';

@ApiTags('Auth')
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'Login with mobile + password' })
  async login(@Body() dto: LoginDto) {
    const data = await this.authService.loginWithPassword(dto.mobile, dto.password);
    return ApiResponseDto.success('Login successful', data);
  }

  @Post('otp/send')
  @ApiOperation({ summary: 'Send OTP to mobile number' })
  async sendOtp(@Body() dto: SendOtpDto) {
    const data = await this.authService.sendOtp(dto.mobile);
    return ApiResponseDto.success(data.message);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify OTP and get tokens' })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    const data = await this.authService.verifyOtp(dto.mobile, dto.otp);
    return ApiResponseDto.success('OTP verified successfully', data);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    const data = await this.authService.refreshAccessToken(dto.refreshToken);
    return ApiResponseDto.success('Token refreshed', data);
  }

  @Post('logout')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout (revoke all refresh tokens)' })
  async logout(@CurrentUser('sub') userId: string) {
    const data = await this.authService.logout(userId);
    return ApiResponseDto.success(data.message);
  }
}
