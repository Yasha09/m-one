import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { AuthRegisterLoginDto } from './dto/auth-register-login.dto';
import { SendgridService } from './sendgrid.service';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { StatusEnum } from '../users/enums/user.status.enum';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { compare, hashPassword } from './utils/hashPassword';
import { JwtPayload } from './types/jwtPayload.type';
import { Tokens } from './types/tokens.type';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    public readonly sendGridService: SendgridService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async register(
    userRegisterDto: AuthRegisterLoginDto,
  ): Promise<{ msg: string }> {
    const { email, name, password } = userRegisterDto;

    const userExists = await this.userService.findByEmail(email);

    if (userExists) {
      throw new BadRequestException('Email already exists');
    }
    const passwordHashed = await hashPassword(password);

    // Email authorisation code
    const hash = crypto
      .createHash('sha256')
      .update(randomStringGenerator())
      .digest('hex');

    await this.userService.createUser({
      name,
      email,
      password: passwordHashed,
      hash,
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
    return {
      msg: 'Successfully created, please check your email',
    };
  }

  async confirmEmail(hash: string): Promise<{ msg: string }> {
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

    return { msg: 'Successfuly activated account by email' };
  }

  async login(
    loginDto: AuthEmailLoginDto,
  ): Promise<{ tokens: Tokens; user: Omit<User, 'password'> }> {
    const user = await this.userService.findByEmail(loginDto.email);
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
    if (!isValidPassword) {
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
    const tokens = await this.getTokens(user.id, user.email);
    await this.userService.setCurrentRefreshToken(
      tokens.refresh_token,
      user.id,
    );
    delete user.password;

    return { tokens, user };
  }

  async getTokens(userId: number, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRATION_DATE'),
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_REFRESH_EXPIRATION_DATE',
        ),
      }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }

  async refreshTokens(
    user,
  ): Promise<{ tokens: Tokens; user: Omit<User, 'password'> }> {
    const tokens = await this.getTokens(user.sub, user.email);
    await this.userService.setCurrentRefreshToken(
      tokens.refresh_token,
      user.id,
    );
    delete user.password;
    return { tokens, user };
  }
}
