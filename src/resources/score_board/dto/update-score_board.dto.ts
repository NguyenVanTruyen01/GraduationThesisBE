import { PartialType } from '@nestjs/mapped-types';
import { CreateScoreBoardDto } from './create-score_board.dto';

export class UpdateScoreBoardDto extends PartialType(CreateScoreBoardDto) { }
