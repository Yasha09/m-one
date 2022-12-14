import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AccessTokenStrategy } from '../auth/strategies/accessToken.strategy';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    UsersModule,
  ],
  providers: [AccessTokenStrategy, ConfigService, UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
