import { Controller, Get, Post, Body, Patch, Param, Delete,Req  } from '@nestjs/common';
import { Request } from 'express';
import { SemesterService } from '../semester.service';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';

@Controller('semester/leader')
export class LeaderSemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Post("createNewSemester")
  async create(@Body() createSemesterDto: CreateSemesterDto) {
    return await this.semesterService.create(createSemesterDto);
  }

  @Get("getAll")
  async findAll() {
    return await this.semesterService.findAll();
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.semesterService.findOne(id);
  }

  @Patch('updateById/:id')
  async update(@Param('id') id: string, @Body() updateSemesterDto: UpdateSemesterDto) {
    return await this.semesterService.update(id, updateSemesterDto);
  }

  @Delete('removeAll')
  async removeAll() {
    return await this.semesterService.removeAll();
  }

  @Delete('deleteById/:id')
  async remove(@Param('id') id: string) {
    return await this.semesterService.remove(id);
  }
}
