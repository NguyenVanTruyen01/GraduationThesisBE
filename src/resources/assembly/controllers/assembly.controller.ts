import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AssemblyService } from '../assembly.service';
import { CreateAssemblyDto } from '../dto/create-assembly.dto';
import { UpdateAssemblyDto } from '../dto/update-assembly.dto';
import { MiddlewareModule } from "@nestjs/core/middleware/middleware-module";

@Controller('assembly')
export class AssemblyController {
  constructor(private readonly assemblyService: AssemblyService) { }

  @Post('create')
  async create(@Body() createAssemblyDto: CreateAssemblyDto) {
    return await this.assemblyService.create(createAssemblyDto);
  }

  @Get('findAll')
  async findAll() {
    return await this.assemblyService.findAll();
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.assemblyService.findOne(id);
  }

  @Patch('updateById/:id')
  async update(@Param('id') id: string, @Body() updateAssemblyDto: UpdateAssemblyDto) {
    return await this.assemblyService.update(id, updateAssemblyDto);
  }

  @Delete('deleteById/:id')
  async remove(@Param('id') id: string) {
    return await this.assemblyService.remove(id);
  }
}
