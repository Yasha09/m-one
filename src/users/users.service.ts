import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({
      data,
    });
  }
  async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hash,
      },
    });
  }

  async getUserIfRefreshTokenValid(refreshToken, userId) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    // variables need to change !!!!!!
    const ifMatchesTokens = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (ifMatchesTokens) {
      return user;
    }
  }
  async getAll() {
    return this.prisma.user.findMany({});
  }
}
