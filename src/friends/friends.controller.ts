import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { FriendsService } from './friends.service';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}
  @UseGuards(AccessTokenGuard)
  @Post('/:userId')
  async friendRequest(
    @Query('userId') friendUserId: number,
    @Req() req: Request,
  ) {
    const user = <{ sub: number; email: string }>req.user;
    const res = await this.friendService.friendRequest(
      user.sub,
      parseInt(req.params.userId),
    );
    console.log('res ----------', res);
    return {
      msg: 'Request successfully sent',
    };
  }

  @UseGuards(AccessTokenGuard)
  @Get()
  async friendsUser(@Req() req: Request) {
    const user = <{ sub: number; email: string }>req.user;
    const res2 = await this.friendService.getAllFriends(user.sub);
    console.log('res2 ', res2);
    return res2;
  }

  @UseGuards(AccessTokenGuard)
  @Get('/requests')
  async requests(@Req() req: Request) {
    const user = <{ sub: number; email: string }>req.user;
    console.log('user ', user);
    const requestsRes = await this.friendService.getUserRequests(user.sub);
    console.log('requestsRes   ', requestsRes);
    return requestsRes;
  }

  @UseGuards(AccessTokenGuard)
  @Post('response')
  async responseRequest(@Body() userFriendResponse) {
    // return this.friendService.responseRequest()
  }
}
