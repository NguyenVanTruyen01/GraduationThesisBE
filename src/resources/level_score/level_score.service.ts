import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLevelScoreDto } from './dto/create-level_score.dto';
import { UpdateLevelScoreDto } from './dto/update-level_score.dto';
import { InjectModel } from "@nestjs/mongoose";
import { LevelScore } from "./models/level_score.model";
import { Model } from "mongoose";
import { ILevelScore } from "./interface/level_score.interface";
import { ValidateUtils } from "../../utils/validate.utils";

@Injectable()
export class LevelScoreService {
  constructor(@InjectModel("LevelScore") private levelScoreModel: Model<ILevelScore>,
    private validateUtils: ValidateUtils) { }

  async create(createLevelScoreDto: CreateLevelScoreDto) {

    //Check level existed
    const levelExist = await this.levelScoreModel.findOne({ level_id: createLevelScoreDto.level_id })
    if (levelExist) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "This level score existed!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    const level_score = await this.levelScoreModel.create(createLevelScoreDto)
    if (!level_score) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Can not create new level!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Create new level successfully!",
        level_score
      }
    }
  }

  async findAll() {
    const level_scores = await this.levelScoreModel.find().sort({ "level_id": 1 });
    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Get all level score successfully!",
        level_scores
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const level_score = await this.levelScoreModel.findById(id).lean();
    if (!level_score) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can not get level score with id: ${id}`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Get level score successfully!",
        level_score
      }
    }
  }

  async update(id: string, updateLevelScoreDto: UpdateLevelScoreDto) {

    this.validateUtils.validateObjectId(id);

    //  Check level existed
    const levelExist = await this.levelScoreModel.findOne({
      _id: { $ne: id }, //không trùng id
      level_id: updateLevelScoreDto.level_id
    });

    if (levelExist) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Level score existed!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    const options = {
      new: true,
    };

    const level_score = await this.levelScoreModel.findByIdAndUpdate(id, updateLevelScoreDto, options);
    if (!level_score) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Can not update this level score!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Update level score successfully!",
        level_score
      }
    }

  }

  async remove(id: string) {

    this.validateUtils.validateObjectId(id);

    const level_score = await this.levelScoreModel.findByIdAndDelete(id).lean();

    if (!level_score) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Can not delete this level score!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Delete level score successfully!",
        level_score
      }
    }
  }

  async removeAll() {
    await this.levelScoreModel.deleteMany({})
    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Delete all level score successfully!",
      }
    }
  }
}
