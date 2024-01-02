import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { RegistrationPeriodService } from '../registration_period.service';
import { CreateRegistrationPeriodDto } from '../dto/create-registration_period.dto';
import { UpdateRegistrationPeriodDto } from '../dto/update-registration_period.dto';
import { Request } from 'express';

@Controller('registration_period/leader')
export class LeaderRegistrationPeriodController {
    constructor(private readonly registrationPeriodService: RegistrationPeriodService) {
    }

    @Post("createRegistrationPeriod")
    async create(@Body() createRegistrationPeriodDto: CreateRegistrationPeriodDto) {
        return await this.registrationPeriodService.create(createRegistrationPeriodDto);
    }


    @Post("getByFilter")
    async leaderGetRegistrationPeriodByFilter(@Req() req: Request) {
        return await this.registrationPeriodService.leaderGetRegistrationPeriodByFilter(req);
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

    @Get('findById/:id')
    async findOne(@Param('id') id: string) {
        return await this.registrationPeriodService.findOne(id);
    }

    @Patch('updateById/:id')
    async update(
        @Param('id') id: string,
        @Body() updateRegistrationPeriodDto: UpdateRegistrationPeriodDto
    ) {
        return await this.registrationPeriodService.update(id, updateRegistrationPeriodDto);
    }

    @Delete('removeAllRegistrationPeriod')
    async removeAll() {
        return await this.registrationPeriodService.removeAll();
    }

    @Delete('deleteById/:id')
    async remove(@Param('id') id: string) {
        return await this.registrationPeriodService.remove(id);
    }
}
