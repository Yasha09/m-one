import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtPayload } from '../types/jwtPayload.type';

export const Auth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Partial<JwtPayload> => {
    try {
      const request = ctx.switchToHttp().getRequest();
      return request.user;
    } catch (error) {
      throw new ForbiddenException();
    }
  },
);
