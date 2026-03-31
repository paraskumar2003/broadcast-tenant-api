import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { User, UserDocument, UserRole } from './schemas/user.schema';
import { RefreshToken, RefreshTokenDocument } from './schemas/refresh-token.schema';

interface TokenPayload {
  sub: string;
  mobile: string;
  role: UserRole;
  name: string;
  type: 'access' | 'refresh';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly otpStore = new Map<string, { otp: string; expiresAt: number }>();

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly configService: ConfigService,
  ) { }

  // ─── Password Login ──────────────────────────────────────────────

  async loginWithPassword(mobile: string, password: string) {
    const user = await this.userModel.findOne({ mobile, status: 'active' });
    if (!user) {
      throw new UnauthorizedException('Invalid mobile number or password');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid mobile number or password');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  // ─── OTP Login ────────────────────────────────────────────────────

  async sendOtp(mobile: string) {
    const user = await this.userModel.findOne({ mobile, status: 'active' });
    if (!user) {
      throw new BadRequestException('No active user found with this mobile number');
    }

    const otp = process.env.NODE_ENV === 'development' ? '123456' : Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    this.otpStore.set(mobile, { otp, expiresAt });

    // TODO: Integrate with actual SMS provider here
    this.logger.log(`OTP for ${mobile}: ${otp} (dev mode)`);

    return { message: 'OTP sent successfully' };
  }

  async verifyOtp(mobile: string, otp: string) {
    const stored = this.otpStore.get(mobile);

    if (!stored) {
      throw new UnauthorizedException('No OTP found. Please request a new one');
    }

    if (Date.now() > stored.expiresAt) {
      this.otpStore.delete(mobile);
      throw new UnauthorizedException('OTP has expired. Please request a new one');
    }

    if (stored.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    this.otpStore.delete(mobile);

    const user = await this.userModel.findOne({ mobile, status: 'active' });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  // ─── Refresh Token ────────────────────────────────────────────────

  async refreshAccessToken(refreshToken: string) {
    // Verify the JWT
    let payload: TokenPayload;
    try {
      payload = jwt.verify(
        refreshToken,
        this.configService.get<string>('jwt.refreshSecret')!,
      ) as TokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    // Check if token exists and is not revoked
    const storedToken = await this.refreshTokenModel.findOne({
      userId: new Types.ObjectId(payload.sub),
      isRevoked: false,
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    const isValid = await bcrypt.compare(refreshToken.slice(-20), storedToken.token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.refreshTokenModel.updateOne(
      { _id: storedToken._id },
      { isRevoked: true },
    );

    // Generate new token pair
    const user = await this.userModel.findById(payload.sub);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User account is inactive');
    }

    const tokens = await this.generateTokens(user);
    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  // ─── Logout ───────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.refreshTokenModel.updateMany(
      { userId: new Types.ObjectId(userId), isRevoked: false },
      { isRevoked: true },
    );
    return { message: 'Logged out successfully' };
  }

  // ─── Token Generation ─────────────────────────────────────────────

  private async generateTokens(user: UserDocument): Promise<AuthTokens> {
    const accessPayload: TokenPayload = {
      sub: user._id.toString(),
      mobile: user.mobile,
      role: user.role,
      name: user.name,
      type: 'access',
    };

    const refreshPayload: TokenPayload = {
      sub: user._id.toString(),
      mobile: user.mobile,
      role: user.role,
      name: user.name,
      type: 'refresh',
    };

    const accessToken = jwt.sign(
      accessPayload,
      this.configService.get<string>('jwt.secret')!,
      { expiresIn: this.configService.get<number>('jwt.accessExpiry') || 900 },
    );

    const refreshToken = jwt.sign(
      refreshPayload,
      this.configService.get<string>('jwt.refreshSecret')!,
      { expiresIn: this.configService.get<number>('jwt.refreshExpiry') || 604800 },
    );

    // Store hashed refresh token in DB
    const tokenHash = await this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.refreshTokenModel.create({
      userId: user._id,
      token: tokenHash,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserDocument) {
    return {
      id: user._id.toString(),
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      status: user.status,
    };
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token.slice(-20), 4); // Hash last 20 chars with low rounds for speed
  }
}
