import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { FriendsService } from './friends.service';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { JwtPayload } from '../auth/types/jwtPayload.type';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendService: FriendsService) {}

  // request for friend
  @UseGuards(AccessTokenGuard)
  @Post('/:userId')
  async friendRequest(
    @Query('userId', ParseIntPipe) friendUserId: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    await this.friendService.friendRequest(user.sub, friendUserId);
    return {
      msg: 'Request successfully sent',
    };
  }

  // Get all friends users
  @UseGuards(AccessTokenGuard)
  @Get()
  async friendsUser(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.friendService.getAllFriends(user.sub);
  }

  // Get all pending Requests
  @UseGuards(AccessTokenGuard)
  @Get('/requests')
  async requests(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.friendService.getUserRequests(user.sub);
  }

  // Response  to the request -boolean
  @UseGuards(AccessTokenGuard)
  @Post('/response/:requestId')
  async responseRequest(
    @Query('requestId', ParseIntPipe) requestId,
    @Body('answer') answer: boolean,
  ) {
    return this.friendService.responseRequest(requestId, answer);
  }
}
