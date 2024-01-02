import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, HttpException, HttpStatus } from '@nestjs/common';
import { TopicsService } from '../topics.service';
import { Leader_CreateTopicDto } from '../dto/leader_create-topic.dto';
import { Leader_UpdateTopicDto } from '../dto/leader_update-topic.dto';
import { Request } from 'express';
import { TOPICS_CONSTANTS } from "../constant/topics.constant";

@Controller('topics/leader')
export class LeaderTopicsController {
    constructor(private readonly topicsService: TopicsService) {
    }

    @Post("createTopic")
    async leaderCreate(
        @Req() req: Request,
        @Body() createTopicDto: Leader_CreateTopicDto
    ) {
        return await this.topicsService.leaderCreate(req, createTopicDto);
    }

    @Post("getTopicByFilter")
    async leaderGetTopicByFilter(@Req() req: Request) {
        return await this.topicsService.leaderGetTopicByFilter(req);
    }

    @Post("getTopicOfTeacher")
    async getTopicOfTeacher(@Body() id: object) {
        return await this.topicsService.getTopicOfTeacher(id);
    }

    @Get("getAll")
    async findAll(
        @Query('skip') skip: number,
        @Query('limit') limit: number,
        @Query('sort') sort: number
    ) {
        return await this.topicsService.leaderFindAll(skip, limit, sort);
    }

    @Get('findById/:id')
    async findOne(@Param('id') id: string) {
        return await this.topicsService.findOne(id);
    }

    @Patch('updateById/:id')
    update(
        @Req() req: Request,
        @Param('id') id: string,
        @Body() updateTopicDto: Leader_UpdateTopicDto
    ) {
        return this.topicsService.leaderUpdateTopic(req, id, updateTopicDto);
    }

    @Post('updateManyTopicsByFilter')
    updateManyTopics(
        @Req() req: Request
    ) {
        return this.topicsService.leaderUpdateManyTopic(req);
    }

    @Post('updateManyTopicsByIds')
    updateManyTopicsByIds(
        @Req() req: Request
    ) {
        return this.topicsService.leaderUpdateManyTopicsByIds(req);
    }

    @Delete('removeAll')
    async removeAll() {
        return await this.topicsService.removeAll();
    }

    @Delete('deleteById/:id')
    remove(@Param('id') id: string) {
        return this.topicsService.remove(id);
    }

    @Post("approveGroupStudent")
    async leaderApproveGroupStudentForProject(
        @Req() req: Request
    ) {
        try {
            return await this.topicsService.leaderApproveGroupStudentForProject(req);
        } catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }

    }

    @Post("updateInfoAssembly")
    async leaderUpdateInfoAssemblyForTopics(
        @Req() req: Request
    ) {
        try {
            return await this.topicsService.leaderUpdateInfoAssemblyForTopics(req);
        } catch (err) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: err.message,
                error: TOPICS_CONSTANTS.ERROR.SERVER_ERROR
            }, HttpStatus.BAD_REQUEST)
        }

    }



}
