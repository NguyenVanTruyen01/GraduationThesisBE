import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { AssemblyService } from '../assembly.service';
import { CreateAssemblyDto } from '../dto/create-assembly.dto';
import { UpdateAssemblyDto } from '../dto/update-assembly.dto';
import { MiddlewareModule } from "@nestjs/core/middleware/middleware-module";
import { Request } from 'express';

@Controller('assembly/teacher')
export class TeacherAssemblyController {
  constructor(private readonly assemblyService: AssemblyService) { }


  @Post('findAllAssemblyOfTeacher')
  async findAllAssemblyOfTeacher(@Req() req: Request) {
    return await this.assemblyService.teacherFindAllAssemblyOfTeacher(req);
  }

}
