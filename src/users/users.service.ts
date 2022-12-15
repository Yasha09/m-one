import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { UserStatus } from '@prisma/client';
import { UserQueryDto } from './dto/userQuery.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    console.log(typeof id);
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        friendUserFriends: true,
      },
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
  async getAll(query: UserQueryDto) {
    const where: Prisma.UserWhereInput = {
      status: UserStatus.Active,
    };
    const { search } = query;
    if (search) {
      Object.keys(search).forEach((key) => {
        if (key !== 'age') {
          where[key as keyof Prisma.UserWhereInput] = {
            startsWith: search[key],
            mode: 'insensitive',
          };
        } else {
          where[key as keyof Prisma.UserWhereInput] = Number(search[key]);
        }
      });
    }

    return await this.prisma.user.findMany({
      where,
      skip: query?.pagination?.skip,
      take: query?.pagination?.take,
    });
  }
}
