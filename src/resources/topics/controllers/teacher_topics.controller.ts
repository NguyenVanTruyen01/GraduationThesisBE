import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { TopicsService } from '../topics.service';
import { Teacher_CreateTopicDto } from '../dto/teacher_create-topic.dto';
import { Teacher_UpdateTopicDto } from '../dto/teacher_update-topic.dto';
import { Request } from "express";
import { TOPICS_CONSTANTS } from "../constant/topics.constant";

@Controller('topics/teacher')
export class TeacherTopicsController {
    constructor(private readonly topicsService: TopicsService) {
    }

    @Post("createTopic")
    async teacherCreate(
        @Req() req: Request,
        @Body() createTopicDto: Teacher_CreateTopicDto
    ) {
        try {
            return await this.topicsService.teacherCreate(req, createTopicDto);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Post("removeGroupFromTopic")
    async teacherRemoveGroupFromTopic(
        @Req() req: Request
    ) {
        try {
            return await this.topicsService.teacherRemoveGroupFromTopic(req);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Post("getTopicByFilter")
    async teacherGetTopicByFilter(@Req() req: Request) {
        try {
            return await this.topicsService.teacherGetTopicByFilter(req);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Post("getTopicOfTeacher")
    async getTopicOfTeacher(@Body() id: object) {
        try {
            return await this.topicsService.getTopicOfTeacher(id);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Get("getAll")
    async findAll(@Query('skip') skip: number,
        @Query('limit') limit: number,
        @Query('sort') sort: number) {
        try {
            return await this.topicsService.findAll(skip, limit, sort);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Get('findById/:id')
    async findOne(@Param('id') id: string) {
        try {
            return await this.topicsService.findOne(id);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Get('getTopicsReview')
    async getTopicsReview(@Req() req: Request) {
        try {
            return await this.topicsService.getTopicsReview(req);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Get('getTopicsAssembly')
    async getTopicsAssembly(@Req() req: Request) {
        try {
            return await this.topicsService.getTopicsAssembly(req);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Patch('updateById/:id')
    teacherUpdateTopic(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateTopicDto: Teacher_UpdateTopicDto
    ) {
        try {
            return this.topicsService.teacherUpdateTopic(req, id, updateTopicDto);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Delete('deleteById/:id')
    remove(
        @Req() req: Request,
        @Param('id') id: string
    ) {
        try {
            return this.topicsService.teacherRemoveTopic(req, id);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }
    }

    @Post("approveGroupStudent")
    async teacherApproveGroupStudentForProject(
        @Req() req: Request
    ) {
        try {
            return await this.topicsService.teacherApproveGroupStudentForProject(req);
        }
        catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }

    }
}
