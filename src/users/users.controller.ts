import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { AccessTokenGuard } from '../common/guards/accessToken.guard';
import { UserQueryDto } from './dto/userQuery.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findById(parseInt(id));
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAll(@Query() query: UserQueryDto) {
    return this.usersService.getAll(query);
  }
}
