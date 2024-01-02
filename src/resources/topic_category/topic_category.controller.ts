import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { TopicCategoryService } from './topic_category.service';
import { CreateTopicCategoryDto } from './dto/create-topic_categorydto';
import { UpdateTopicCategoryDto } from './dto/update-topic_category.dto';

@Controller('topic_category')
export class TopicCategoryController {
  constructor(private readonly topicCategoryService: TopicCategoryService) { }

  @Post('create')
  async create(@Body() createTopicCategoryDto: CreateTopicCategoryDto) {
    return await this.topicCategoryService.create(createTopicCategoryDto);
  }

  @Get('getAll')
  async findAll() {
    return await this.topicCategoryService.findAll();
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.topicCategoryService.findOne(id);
  }

  @Patch('updateById/:id')
  async update(@Param('id') id: string, @Body() updateFacultyDto: UpdateTopicCategoryDto) {
    return await this.topicCategoryService.update(id, updateFacultyDto);
  }

  @Delete('deleteAll')
  async removeAll() {
    return await this.topicCategoryService.removeAll();
  }

  @Delete('deleteById/:id')
  async remove(@Param('id') id: string) {
    return await this.topicCategoryService.remove(id);
  }

}
