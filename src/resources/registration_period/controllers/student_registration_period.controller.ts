import {Controller, Get, Post, Body, Patch, Param, Delete, Query} from '@nestjs/common';
import {RegistrationPeriodService} from '../registration_period.service';

@Controller('registration_period/student')
export class StudentRegistrationPeriodController {
    constructor(private readonly registrationPeriodService: RegistrationPeriodService) {
    }

    @Get('getCurrentRegistrationPeriod')
    async getCurrentRegistrationPeriod() {
        return await this.registrationPeriodService.getCurrentRegistrationPeriod();
    }

    @Get("getAll")
    async findAll(
        @Query('skip') skip: number,
        @Query('limit') limit: number
    ) {
        return await this.registrationPeriodService.findAll(skip, limit);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.registrationPeriodService.findOne(id);
    }

}
