import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { RubricService } from '../rubric.service';
import { CreateRubricDto } from '../dto/create-rubric.dto';
import { UpdateRubricDto } from '../dto/update-rubric.dto';
import { Request } from 'express';

@Controller('rubric/leader')
export class LeaderRubricController {
  constructor(private readonly scoreboardService: RubricService) { }

  @Post('create')
  async create(@Body() createRubricDto: CreateRubricDto) {
    return await this.scoreboardService.create(createRubricDto);
  }

  @Post('getByFilter')
  async getRubricByFilter(@Req() req: Request) {
    return await this.scoreboardService.getRubricByFilter(req);
  }

  @Get('findAll')
  async findAll() {
    return await this.scoreboardService.findAll();
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.scoreboardService.findOne(id);
  }

  @Patch('updateById/:id')
  async update(@Param('id') id: string, @Body() updateRubricDto: UpdateRubricDto) {
    return await this.scoreboardService.update(id, updateRubricDto);
  }

  @Delete('deleteById/:id')
  async remove(@Param('id') id: string) {
    return await this.scoreboardService.remove(id);
  }

}
