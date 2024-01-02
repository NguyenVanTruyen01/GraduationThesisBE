import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRubricDto } from './dto/create-rubric.dto';
import { UpdateRubricDto } from './dto/update-rubric.dto';
import { InjectModel } from "@nestjs/mongoose";
import { IRubric } from "./interface/rubric.interface";
import { Model } from "mongoose";
import { ValidateUtils } from "../../utils/validate.utils";
import { RUBRIC_CONSTANTS } from "./constant/rubric.constant"
import { ITopic } from '../topics/interface/topic.interface';

@Injectable()
export class RubricService {

  constructor(
    @InjectModel("Rubric") private rubricModel: Model<IRubric>,
    @InjectModel("Topic") private topicModel: Model<ITopic>,
    private validateUtils: ValidateUtils) { }

  async create(createRubricDto: CreateRubricDto) {

    const newRubric = await this.rubricModel.create(createRubricDto);

    if (!newRubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Tạo mới rubric chấm điểm thất bại!",
        error: RUBRIC_CONSTANTS.ERROR.CREATED_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Tạo mới rubric chấm điểm thành công!",
      data: {
        rubric: newRubric
      }
    }
  }

  async getRubricByFilter(req) {

    const filter = req.body.filter;

    const rubrics = await this.rubricModel
      .find(filter)
      .populate("rubric_evaluations rubric_topic_category")
      .lean()

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy danh sách rubric thành công!",
      error: null,
      data: {
        rubrics
      }
    }
  }

  async findAll() {
    const rubrics = await this.rubricModel.find()
      .populate("rubric_evaluations rubric_topic_category")

    return {
      statusCode: HttpStatus.OK,
      message: "lấy tất cả rubric thành công!",
      data: {
        rubrics
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const rubric = await this.rubricModel.findById(id)
    // .populate("rubric_evaluations rubric_topic_category")

    if (!rubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric không tồn tại!`,
        error: RUBRIC_CONSTANTS.ERROR.NOT_FOUND
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy chi tiết rubric thành công!",
      data: {
        rubric
      }
    }

  }

  async update(id: string, updateRubricDto: UpdateRubricDto) {
    this.validateUtils.validateObjectId(id);

    const usedRubric = await this.topicModel.findOne({
      $or: [
        { rubric_instructor: id },
        { rubric_reviewer: id },
        { rubric_assembly: id }
      ]
    })

    if (usedRubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric này đã được sử dụng. Không được phép thực hiện hành động này!`,
        error: RUBRIC_CONSTANTS.ERROR.ACTION_FORBIDDEN
      }, HttpStatus.BAD_REQUEST)
    }

    const options = {
      new: true,
    };

    const rubric = await this.rubricModel
      .findByIdAndUpdate(id, updateRubricDto, options)
      .populate("rubric_evaluations rubric_topic_category")

    if (!rubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric không tồn tại!`,
        error: RUBRIC_CONSTANTS.ERROR.NOT_FOUND
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Cập nhật rubric thành công!",
      data: {
        rubric
      }
    }
  }

  async remove(id: string) {
    this.validateUtils.validateObjectId(id);

    const usedRubric = await this.topicModel.findOne({
      $or: [
        { rubric_instructor: id },
        { rubric_reviewer: id },
        { rubric_assembly: id }
      ]
    })

    if (usedRubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric này đã được sử dụng. Không được phép thực hiện hành động này!`,
        error: RUBRIC_CONSTANTS.ERROR.ACTION_FORBIDDEN
      }, HttpStatus.BAD_REQUEST)
    }

    const rubric = await this.rubricModel.findByIdAndDelete(id).lean();

    if (!rubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric không tồn tại!`,
        error: RUBRIC_CONSTANTS.ERROR.NOT_FOUND,
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Xóa rubric thành công!",
      data:
        rubric
    }
  }
}
