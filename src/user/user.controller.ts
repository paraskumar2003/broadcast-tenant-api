import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from './schemas/user.schema';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { CreateUserDto, GrantAccessDto } from './dto/user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post()
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Create a new user (Master/Super only)' })
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: any) {
    // Super can only create executives
    if (user.role === UserRole.SUPER && dto.role !== UserRole.EXECUTIVE) {
      return ApiResponseDto.error('Super users can only create executives');
    }

    const data = await this.userService.createUser({
      ...dto,
      createdBy: user.sub,
    });
    return ApiResponseDto.success('User created', {
      id: data._id,
      name: data.name,
      mobile: data.mobile,
      role: data.role,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List users (role-filtered)' })
  async list(@CurrentUser() user: any) {
    const data = await this.userService.listUsers({
      sub: user.sub,
      role: user.role,
    });
    return ApiResponseDto.success('Users fetched', data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getById(@Param('id') id: string) {
    const data = await this.userService.getUserById(id);
    return ApiResponseDto.success('User fetched', data);
  }

  @Put(':id')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Update user (Master/Super only)' })
  async update(@Param('id') id: string, @Body() body: { name?: string; status?: string }) {
    const data = await this.userService.updateUser(id, body);
    return ApiResponseDto.success('User updated', data);
  }

  @Delete(':id')
  @Roles(UserRole.MASTER)
  @ApiOperation({ summary: 'Delete user (Master only)' })
  async delete(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return ApiResponseDto.success('User deleted');
  }

  // ─── Project Access Grants ────────────────────────────────────────

  @Post('access/grant')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Grant project access to an executive' })
  async grantAccess(@Body() dto: GrantAccessDto, @CurrentUser() user: any) {
    const data = await this.userService.grantProjectAccess(
      dto.userId,
      dto.projectId,
      user.sub,
      user.role,
    );
    return ApiResponseDto.success('Access granted', data);
  }

  @Post('access/revoke')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'Revoke project access from an executive' })
  async revokeAccess(@Body() dto: GrantAccessDto) {
    const data = await this.userService.revokeProjectAccess(dto.userId, dto.projectId);
    return ApiResponseDto.success(data.message);
  }

  @Get('access/:userId')
  @Roles(UserRole.MASTER, UserRole.SUPER)
  @ApiOperation({ summary: 'List project access grants for a user' })
  async listAccess(@Param('userId') userId: string) {
    const data = await this.userService.listUserAccess(userId);
    return ApiResponseDto.success('Access list fetched', data);
  }
}
