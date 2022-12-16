import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SendgridService } from './sendgrid.service';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { UsersService } from '../users/users.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUsersService = {
    register: jest.fn(() => {
      return {
        msg: 'Successfully created, please check your email',
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        JwtModule.register({}),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        UsersModule,
      ],
      controllers: [AuthController],
      providers: [
        AuthService,
        SendgridService,
        AccessTokenStrategy,
        RefreshTokenStrategy,
        UsersService,
      ],
    })
      .overrideProvider(AuthService)
      .useValue(mockUsersService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be create user', async () => {
    expect(
      await controller.register({
        firstName: 'john',
        lastName: 'McJohn',
        email: 'john@gmail.com',
        age: 22,
        password: 'admin123A!',
        confirmPassword: 'admin123A!',
      }),
    ).toEqual({
      msg: 'Successfully created, please check your email',
    });
    expect(mockUsersService.register).toHaveBeenCalled();
  });
});
