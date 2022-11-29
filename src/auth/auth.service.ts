import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { SendgridService } from './sendgrid.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { StatusEnum } from '../users/enums/user.status.enum';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { compare, hashPassword } from './utils/hashPassword';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    public readonly sendGridService: SendgridService,
    private jwtService: JwtService,
  ) {}

  async register(userRegisterDto: AuthRegisterLoginDto) {
    const { email, name, password } = userRegisterDto;

    const userExists = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (userExists) {
      throw new BadRequestException('Email already exists');
    }
    const passwordHashed = await hashPassword(password);

    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await this.prisma.user.create({
      data: {
        name,
        email,
        password: passwordHashed,
        hash,
      },
    });
    await this.sendGridService
      .send({
        to: email,
        subject: 'Confirm Email',
        from: this.configService.get('SENDER_EMAIL'),
        text: `Welcome to the team,  Please, follow the "LINK OF FRONTEND" and use confirmation code ${hash} to be able to log in`,
      })
      .then((res) => {
        console.log('success', res);
      })
      .catch((err) => {
        console.log('err ', err);
      });
  }

  async confirmEmail(hash: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        hash,
      },
    });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          error: `notFound`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    //  It needs change
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        status: StatusEnum.Active,
      },
    });
  }

  async login(
    loginDto: AuthEmailLoginDto,
  ): Promise<{ tokens: Tokens; user: Omit<User, 'password'> }> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });
    if (!user || user.status !== StatusEnum.Active) {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            email: 'notFound',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const isValidPassword = await compare(loginDto.password, user.password);
    if (isValidPassword) {
      const tokens = await this.getTokens(user.id, user.email);
      this.prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          refreshToken: tokens.refresh_token,
        },
      });
      delete user.password;

      return { tokens, user };
    } else {
      throw new HttpException(
        {
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            password: 'incorrectPassword',
          },
        },
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('AT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('RT_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async refreshTokens(
    userId: number,
  ): Promise<{ tokens: Tokens; user: Omit<User, 'password'> }> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        refreshToken: tokens.refresh_token,
      },
    });

    return { tokens, user };
  }
}
