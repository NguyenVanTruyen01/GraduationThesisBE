import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('users')
export class AuthUsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto){
    return await this.usersService.signup(createUserDto);
  }

  @Post('login')
  async login(@Body() user: object){
    return await this.usersService.login(user);
  }

}
