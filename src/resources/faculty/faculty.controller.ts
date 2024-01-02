import {Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus} from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';

@Controller('faculty')
export class FacultyController {
  constructor(private readonly facultyService: FacultyService) {}

  @Post()
  async create(@Body() createFacultyDto: CreateFacultyDto) {
    return await this.facultyService.create(createFacultyDto);
  }

  @Get()
  async findAll() {
    return await this.facultyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.facultyService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFacultyDto: UpdateFacultyDto) {
      return await this.facultyService.update(id, updateFacultyDto);
  }

  @Delete('deleteAll')
  async removeAll() {
    return await this.facultyService.removeAll();
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.facultyService.remove(id);
  }

}
