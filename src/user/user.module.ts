import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User, UserSchema } from './schemas/user.schema';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import {
  UserProjectAccess,
  UserProjectAccessSchema,
} from './schemas/user-project-access.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: UserProjectAccess.name, schema: UserProjectAccessSchema },
    ]),
  ],
  providers: [AuthService, UserService],
  controllers: [AuthController, UserController],
  exports: [UserService, AuthService],
})
export class UserModule { }
