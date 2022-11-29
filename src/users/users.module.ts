import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  providers: [JwtStrategy, ConfigService, UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
