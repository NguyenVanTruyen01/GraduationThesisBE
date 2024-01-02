import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { GroupStudentService } from '../group_student.service';
import { CreateGroupStudentDto } from '../dto/create-group_student.dto';
import { UpdateGroupStudentDto } from '../dto/update-group_student.dto';
import { Request } from 'express';

@Controller('group-student/leader')
export class LeaderGroupStudentController {
  constructor(private readonly groupStudentService: GroupStudentService) { }

  @Post('create')
  async create(@Body() createGroupStudentDto: CreateGroupStudentDto) {
    return await this.groupStudentService.create(createGroupStudentDto);
  }

  @Get('findAll')
  async findAll(@Req() req: Request) {
    return await this.groupStudentService.findAll();
  }

  @Post('getManyGroupStudent')
  async getManyGroupStudent(@Req() req: Request) {
    return await this.groupStudentService.getManyGroupStudent(req);
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.groupStudentService.findOne(id);
  }

  @Patch('addMember/:id')
  async addMembers(@Param('id') id: string, @Body() idsMember: any) {
    return await this.groupStudentService.addMembers(id, idsMember);
  }

  @Patch('removeMember/:id')
  async removeMembers(@Param('id') id: string, @Body() idsMember: any) {
    return await this.groupStudentService.removeMembers(id, idsMember);
  }

  @Patch('updateById/:id')
  async update(@Param('id') id: string, @Body() updateGroupStudentDto: UpdateGroupStudentDto) {
    return await this.groupStudentService.update(id, updateGroupStudentDto);
  }

  @Delete('deleteById/:id')
  async remove(@Param('id') id: string) {
    return await this.groupStudentService.remove(id);
  }
}
