import {Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus} from '@nestjs/common';
import { LevelScoreService } from './level_score.service';
import { CreateLevelScoreDto } from './dto/create-level_score.dto';
import { UpdateLevelScoreDto } from './dto/update-level_score.dto';

@Controller('level-score')
export class LevelScoreController {
  constructor(private readonly levelScoreService: LevelScoreService) {}

  @Post()
  async create(@Body() createLevelScoreDto: CreateLevelScoreDto) {
      return await this.levelScoreService.create(createLevelScoreDto);
  }

  @Get()
  async findAll() {
      return await this.levelScoreService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
      return await this.levelScoreService.findOne(id);

  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLevelScoreDto: UpdateLevelScoreDto) {
      return this.levelScoreService.update(id, updateLevelScoreDto);
  }

  @Delete('removeAll')
  async removeAll() {
    try{
      return this.levelScoreService.removeAll();
    }catch (err){
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: "Can not delete all level score! "
      }, HttpStatus.BAD_REQUEST)
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
      return this.levelScoreService.remove(id);
  }

}
