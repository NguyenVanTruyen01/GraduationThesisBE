import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import { RegistrationPeriodService } from '../registration_period.service';
import { CreateRegistrationPeriodDto } from '../dto/create-registration_period.dto';
import { UpdateRegistrationPeriodDto } from '../dto/update-registration_period.dto';

@Controller('registration_period/teacher')
export class TeacherRegistrationPeriodController {
  constructor(private readonly registrationPeriodService: RegistrationPeriodService) {}


  @Get('getCurrentRegistrationPeriod')
  async getCurrentRegistrationPeriod() {
    return await this.registrationPeriodService.getCurrentRegistrationPeriod();
  }


  @Get("getAll")
  async findAll(
      @Query('skip') skip: number,
      @Query('limit') limit: number
  ){
    return await this.registrationPeriodService.findAll(skip,limit);
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.registrationPeriodService.findOne(id);
  }
}
