import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RubricEvaluationService } from '../rubric_evaluation.service';
import { CreateRubricEvaluationDto } from '../dto/create-rubric_evaluation.dto';
import { UpdateRubricEvaluationDto } from '../dto/update-rubric_evaluation.dto';

@Controller('rubric_evaluation/leader')
export class LeaderRubricEvaluationController {
  constructor(private readonly rubricEvaluationService: RubricEvaluationService) { }

  @Post('create')
  async create(@Body() createScoreboardDto: CreateRubricEvaluationDto) {
    return await this.rubricEvaluationService.create(createScoreboardDto);
  }

  @Post('createManyEvaluation')
  async createManyEvaluation(@Body() evaluations: CreateRubricEvaluationDto[]) {
    return await this.rubricEvaluationService.createManyEvaluation(evaluations);
  }


  @Get('findAll')
  async findAll() {
    return await this.rubricEvaluationService.findAll();
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.rubricEvaluationService.findOne(id);
  }

  @Patch('updateById/:id')
  async update(@Param('id') id: string, @Body() updateScoreboardDto: UpdateRubricEvaluationDto) {
    return await this.rubricEvaluationService.update(id, updateScoreboardDto);
  }

  @Delete('deleteById/:id')
  async remove(@Param('id') id: string) {
    return await this.rubricEvaluationService.remove(id);
  }
}
