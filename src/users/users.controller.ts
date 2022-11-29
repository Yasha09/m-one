import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  getAll() {
    return this.usersService.getAll();
  }
}
