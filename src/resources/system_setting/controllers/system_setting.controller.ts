import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { SystemSettingService } from '../system_setting.service';
import { CreateSystemSettingDto } from '../dto/create-system_setting.dto';
import { UpdateSystemSettingDto } from '../dto/update-system_setting.dto';
import { Request } from 'express';
@Controller('system_setting')
export class SystemSettingController {

    constructor(private readonly systemSettingService: SystemSettingService) {
    }

    @Post("create")
    async create(@Body() createSystemSettingDto: CreateSystemSettingDto) {
        return await this.systemSettingService.create(createSystemSettingDto);
    }

    @Get('getSystemSetting')
    async findOne(@Req() req: Request) {
        return await this.systemSettingService.findOne(req);
    }

    @Patch('updateById/:id')
    async update(
        @Param('id') id: string,
        @Body() updateSystemSettingDto: UpdateSystemSettingDto
    ) {
        return await this.systemSettingService.update(id, updateSystemSettingDto);
    }
}
