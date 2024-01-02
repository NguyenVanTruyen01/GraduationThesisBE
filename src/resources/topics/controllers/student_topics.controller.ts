import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { TopicsService } from '../topics.service';

import { Student_CreateTopicDto } from '../dto/student_create-topic.dto';
import { Student_UpdateTopicDto } from '../dto/student_update-topic.dto';

import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/helpers/config';

@Controller('topics/student')
export class StudentTopicsController {
    constructor(private readonly topicsService: TopicsService) {
    }

    @Post("createTopic")
    async studentCreate(
        @Req() req: Request,
        @Body() createTopicDto: Student_CreateTopicDto
    ) {
        return await this.topicsService.studentCreate(req, createTopicDto);
    }

    @Post("getTopicOfTeacher")
    async studentGetTopicOneTeacher(
        @Body() id: object
    ) {
        return await this.topicsService.studentGetTopicOneTeacher(id);
    }

    @Post("registerTopic")
    async studentRegisterTopic(
        @Req() req: Request
    ) {
        return await this.topicsService.studentRegisterTopic(req);
    }

    @Post("cancelProjectRegistration")
    async studentCancelProjectRegistration(
        @Req() req: Request
    ) {
        return await this.topicsService.studentCancelProjectRegistration(req);
    }

    @Get("getMyRegisteredTopics")
    async getMyRegisteredTopics(
        @Req() req: Request
    ) {
        return await this.topicsService.getMyRegisteredTopics(req);
    }

    @Get("getAll")
    async findAll(
        @Query('skip') skip: number,
        @Query('limit') limit: number,
        @Query('sort') sort: number
    ) {
        return await this.topicsService.studentGetAll(skip, limit, sort);
    }

    @Get('findById/:id')
    async findOne(
        @Param('id') id: string
    ) {
        return await this.topicsService.findOne(id);
    }

    @Patch('updateById/:id')
    studentUpdateTopic(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateTopicDto: Student_UpdateTopicDto
    ) {
        return this.topicsService.studentUpdateTopic(req, id, updateTopicDto);
    }

    @Delete('deleteById/:id')
    remove(
        @Req() req: Request,
        @Param('id') id: string
    ) {
        return this.topicsService.studentRemoveTopic(req, id);
    }

    @Post('uploadFile')
    @UseInterceptors(FileInterceptor('topic_file', { storage: storageConfig('topic_file') }))
    async uploadFileForTopic(@Req() req: any,
        @UploadedFile() file: Express.Multer.File
    ) {

        if (!file) {
            throw new BadRequestException("Vui lòng chọn tập tin để tải lên!")
        }

        let fileUrl: string = file.fieldname + '/' + file.filename;
        return await this.topicsService.studentUploadFileForTopic(req, fileUrl);
    }

}
