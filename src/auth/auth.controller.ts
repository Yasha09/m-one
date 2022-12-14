import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthService } from './auth.service';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { RefreshTokenGuard } from '../common/guards/refreshToken.guard';

@Controller('auth')
export class AuthController {
  constructor(public service: AuthService) {}

  @Post('email/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createUserDto: AuthRegisterLoginDto) {
    return this.service.register(createUserDto);
  }

  @Post('email/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmEmail(@Body() confirmEmailDto: AuthConfirmEmailDto) {
    return this.service.confirmEmail(confirmEmailDto.hash);
  }

  @Post('email/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDTO: AuthEmailLoginDto) {
    return this.service.login(loginDTO);
  }

  // user.id need to change to refresh token and check their expiration date
  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh_token(@Req() req: Request) {
    return this.service.refreshTokens(req.user);
  }
}
