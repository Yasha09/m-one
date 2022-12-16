import { Injectable } from '@nestjs/common';
import { FriendsStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async friendRequest(userId: number, friendUserId: number) {
    return this.prisma.friends.upsert({
      where: {
        userId_friendUserId: {
          friendUserId,
          userId,
        },
      },
      update: {},
      create: {
        friendUserId,
        userId,
      },
    });
  }

  async getAllFriends(userId) {
    return this.prisma.friends.findMany({
      where: {
        userId,
      },
      select: {
        friendUserId: true,
      },
    });
  }

  async getUserRequests(userId) {
    console.log('userId ', userId);
    return this.prisma.friends.findMany({
      where: {
        friendUserId: userId,
        stetus: FriendsStatus.Pending,
      },
    });
  }

  async responseRequest(requestId: number, answer: boolean) {
    return this.prisma.friends.update({
      where: {
        id: requestId,
      },
      data: {
        stetus: answer ? FriendsStatus.Accepted : FriendsStatus.Declined,
      },
    });
  }
}
