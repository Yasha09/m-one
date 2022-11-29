import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { validate } from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
  ],
})
export class AppModule {}
