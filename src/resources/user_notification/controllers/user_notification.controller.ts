import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UserNotificationService } from '../user_notification.service';
import { CreateUserNotificationDto } from '../dto/create-user_notification.dto';
import { UpdateUserNotificationDto } from '../dto/update-user_notification.dto';
import { Request } from 'express';

@Controller('user_notification')
export class UserNotificationController {
  constructor(private readonly userNotificationService: UserNotificationService) { }

  @Post('create')
  async create(@Body() createUserNotificationDto: CreateUserNotificationDto) {
    return await this.userNotificationService.create(createUserNotificationDto);
  }

  @Post('sendNotiForStudentOfTopics')
  async sendNotifyForStudentManyTopics(@Req() req: Request) {
    return await this.userNotificationService.sendNotifyForStudentManyTopics(req);
  }

  @Post('sendNotifyForManyUsers')
  async sendNotifyForManyUsers(@Req() req: Request) {
    return await this.userNotificationService.sendNotifyForManyUsers(req);
  }

  @Get('findAll')
  async findAll(@Req() req: Request) {
    return await this.userNotificationService.findAll(req);
  }

  @Get('findById/:id')
  async findOne(@Req() req: Request, @Param('id') id: string) {
    return await this.userNotificationService.findOne(req, id);
  }

  @Patch('updateById/:id')
  async update(@Param('id') id: string, @Body() updateUserNotificationDto: UpdateUserNotificationDto) {
    return await this.userNotificationService.update(id, updateUserNotificationDto);
  }

  @Delete('deleteById/:id')
  async remove(
    @Req() req: Request,
    @Param('id') id: string
  ) {
    return await this.userNotificationService.remove(req, id);
  }

  @Post('deleteMany')
  async deleteMany(@Req() req: Request) {
    return await this.userNotificationService.deleteMany(req);
  }

}
