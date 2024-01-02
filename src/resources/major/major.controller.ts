import {Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus} from '@nestjs/common';
import { MajorService } from './major.service';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';

@Controller('major')
export class MajorController {
  constructor(private readonly majorService: MajorService) {}

  @Post()
  async create(@Body() createMajorDto: CreateMajorDto) {
    return await this.majorService.create(createMajorDto);
  }

  @Get()
  async findAll() {
    return await this.majorService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
      return await this.majorService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateMajorDto: UpdateMajorDto) {
        return await this.majorService.update(id, updateMajorDto);

  }

  @Delete('deleteAll')
  async removeAll() {
      return await this.majorService.removeAll();
  }

  @Delete(':id')
 async remove(@Param('id') id: string) {
        return  await this.majorService.remove(id);
  }
}
