import { PartialType } from '@nestjs/mapped-types';
import { CreateLevelScoreDto } from './create-level_score.dto';

export class UpdateLevelScoreDto extends PartialType(CreateLevelScoreDto) {}
