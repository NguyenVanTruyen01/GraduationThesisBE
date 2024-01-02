import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req } from '@nestjs/common';
import { ScoreBoardService } from '../score_board.service';
import { CreateScoreBoardDto } from '../dto/create-score_board.dto';
import { UpdateScoreBoardDto } from '../dto/update-score_board.dto';
import { Request } from 'express';

@Controller('scoreboard/student')
export class StudentScoreBoardController {
  constructor(private readonly scoreBoardService: ScoreBoardService) { }

  @Post('getByFilter')
  async studentGetScoreBoardByFilter(@Req() req: Request) {
    return await this.scoreBoardService.studentGetScoreBoardByFilter(req);
  }
}
