import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SemesterService } from '../semester.service';
import { CreateSemesterDto } from '../dto/create-semester.dto';
import { UpdateSemesterDto } from '../dto/update-semester.dto';

@Controller('semester/student')
export class StudentSemesterController {
  constructor(private readonly semesterService: SemesterService) {}

  @Get("getAll")
  async findAll() {
    return await this.semesterService.findAll();
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.semesterService.findOne(id);
  }
}
