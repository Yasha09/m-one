import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { AuthService } from './auth.service';
import { AuthConfirmEmailDto } from './dto/auth-confirm-email.dto';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { Auth } from './decorators/user.decorator';

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

  @Post('refresh')
  @UseGuards(AuthGuard('jwt'))
  async refresh_token(@Auth() user) {
    return this.service.refreshTokens(user.sub);
  }
}
