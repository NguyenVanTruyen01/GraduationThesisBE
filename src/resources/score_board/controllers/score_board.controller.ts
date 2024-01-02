import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus, Req } from '@nestjs/common';
import { ScoreBoardService } from '../score_board.service';
import { CreateScoreBoardDto } from '../dto/create-score_board.dto';
import { UpdateScoreBoardDto } from '../dto/update-score_board.dto';
import { Request } from 'express';

@Controller('scoreboard')
export class ScoreBoardController {
  constructor(private readonly scoreBoardService: ScoreBoardService) { }

  @Post('create')
  async create(@Body() createScoreBoardDto: CreateScoreBoardDto) {
    return await this.scoreBoardService.create(createScoreBoardDto);
  }

  @Post('getByFilter')
  async getScoreBoardByFilter(@Req() req: Request) {
    return await this.scoreBoardService.getScoreBoardByFilter(req);
  }

  @Get('findAll')
  async findAll() {
    return await this.scoreBoardService.findAll();
  }

  @Get('findbyId/:id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.scoreBoardService.findOne(id);
    } catch (err) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        message: "Không thể lấy bảng điểm!"
      }, HttpStatus.BAD_REQUEST)
    }
  }

  @Patch('updateById/:id')
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateScoreBoardDto: UpdateScoreBoardDto
  ) {
    return await this.scoreBoardService.update(req, id, updateScoreBoardDto);
  }

  @Post('getManyScoreBoardsByFilter')
  async getManyScoreBoardsOfStudent(@Req() req: Request) {
    return await this.scoreBoardService.getManyScoreBoardsOfStudent(req);
  }

  @Post('adminBlockScores')
  async adminBlockScores(@Req() req: Request) {
    return await this.scoreBoardService.adminBlockScores(req);
  }

  // @Delete('removeAll')
  // async removeAll() {
  //   try {
  //     return this.scoreBoardService.removeAll();
  //   } catch (err) {
  //     throw new HttpException({
  //       status: HttpStatus.BAD_REQUEST,
  //       message: "Can not delete all score! "
  //     }, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // @Delete(':id')
  // async remove(@Param('id') id: string) {
  //   try {
  //     return await this.scoreBoardService.remove(id);
  //   } catch (err) {
  //     throw new HttpException({
  //       status: HttpStatus.BAD_REQUEST,
  //       message: "Can not get this score!"
  //     }, HttpStatus.BAD_REQUEST)
  //   }
  // }
}
