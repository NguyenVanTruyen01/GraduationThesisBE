import { PartialType } from '@nestjs/mapped-types';
import { CreateRubricEvaluationDto } from './create-rubric_evaluation.dto';

export class UpdateRubricEvaluationDto extends PartialType(CreateRubricEvaluationDto) { }
