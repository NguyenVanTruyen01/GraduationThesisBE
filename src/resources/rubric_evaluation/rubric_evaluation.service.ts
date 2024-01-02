import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRubricEvaluationDto } from './dto/create-rubric_evaluation.dto';
import { UpdateRubricEvaluationDto } from './dto/update-rubric_evaluation.dto';
import { InjectModel } from "@nestjs/mongoose";
import { IRubricEvaluation } from "./interface/rubric_evaluation.interface";
import { Model } from "mongoose";
import { ValidateUtils } from "../../utils/validate.utils";
import { RUBRIC_EVALUTION } from "./constant/rubric_evaluation.constant"
import { IRubric } from '../rubric/interface/rubric.interface';
import { ITopic } from '../topics/interface/topic.interface';

@Injectable()
export class RubricEvaluationService {

  constructor(
    @InjectModel("RubricEvaluation") private rubricEvaluationModel: Model<IRubricEvaluation>,
    @InjectModel("Rubric") private rubricModel: Model<IRubric>,
    @InjectModel("Topic") private topicModel: Model<ITopic>,
    private validateUtils: ValidateUtils) { }

  async create(createScoreboardDto: CreateRubricEvaluationDto) {

    const rubric = await this.rubricModel.findById(createScoreboardDto.rubric_id);
    if (!rubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Rubric không tồn tại!",
        error: RUBRIC_EVALUTION.ERROR.MISSING_DATA
      }, HttpStatus.BAD_REQUEST)
    }

    const usedRubric = await this.topicModel.findOne({
      $or: [
        { rubric_instructor: createScoreboardDto.rubric_id },
        { rubric_reviewer: createScoreboardDto.rubric_id },
        { rubric_assembly: createScoreboardDto.rubric_id }
      ]
    })

    if (usedRubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric này đã được sử dụng. Không được phép thực hiện hành động này!`,
        error: RUBRIC_EVALUTION.ERROR.ACTION_FORBIDDEN
      }, HttpStatus.BAD_REQUEST)
    }

    const rubric_evaluation: any = await this.rubricEvaluationModel.create(createScoreboardDto);

    if (!rubric_evaluation) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Tạo mới tiêu chí đánh giá thất bại!",
        error: RUBRIC_EVALUTION.ERROR.CREATED_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    // Thêm tiêu chí đánh giá vào rubric
    await this.rubricModel.findByIdAndUpdate(
      rubric._id,
      { $push: { rubric_evaluations: rubric_evaluation._id } },
    )

    return {
      statusCode: HttpStatus.OK,
      message: "Tạo mới tiêu chí đánh giá thành công!",
      data: {
        rubric_evaluation: rubric_evaluation
      }
    }
  }

  async createManyEvaluation(evaluations: CreateRubricEvaluationDto[]) {

    if (!evaluations || evaluations.length < 1) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Dữ liệu đầu vào không hợp lệ!`,
        error: RUBRIC_EVALUTION.ERROR.ACTION_FORBIDDEN
      }, HttpStatus.BAD_REQUEST)
    }

    const rubric_id = evaluations[0].rubric_id;

    const usedRubric = await this.topicModel.findOne({
      $or: [
        { rubric_instructor: rubric_id },
        { rubric_reviewer: rubric_id },
        { rubric_assembly: rubric_id }
      ]
    })

    if (usedRubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric này đã được sử dụng. Không được phép thực hiện hành động này!`,
        error: RUBRIC_EVALUTION.ERROR.ACTION_FORBIDDEN
      }, HttpStatus.BAD_REQUEST)
    }

    const rubric_evaluations: any = await this.rubricEvaluationModel.insertMany(evaluations);

    if (!rubric_evaluations && rubric_evaluations.lenght < 0) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Tạo mới tiêu chí đánh giá thất bại!",
        error: RUBRIC_EVALUTION.ERROR.CREATED_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    const evaluationIds = rubric_evaluations.map(item => item._id);

    // Thêm tiêu chí đánh giá vào rubric
    await this.rubricModel.findByIdAndUpdate(
      evaluations[0].rubric_id,
      { $set: { rubric_evaluations: evaluationIds } }
    )

    return {
      statusCode: HttpStatus.OK,
      message: "Tạo mới tiêu chí đánh giá thành công!",
      data: {
        rubric_evaluations
      }
    }
  }

  async findAll() {
    const rubric_evaluations = await this.rubricEvaluationModel.find()
      .populate("level_core")

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy tất cả tiêu chí thành công!",
      data: {
        rubric_evaluations
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const rubric_evaluation = await this.rubricEvaluationModel.findById(id)
      .populate("level_core")

    if (!rubric_evaluation) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Tiêu chí đánh giá không tồn tại!`,
        error: RUBRIC_EVALUTION.ERROR.NOT_FOUND
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy chi tiết tiêu chi đánh giá thành công!",
      data: {
        rubric_evaluation
      }
    }

  }

  async update(id: string, updateScoreboardDto: UpdateRubricEvaluationDto) {
    this.validateUtils.validateObjectId(id);

    const options = {
      new: true,
    };

    const rubric_evaluation = await this.rubricEvaluationModel
      .findByIdAndUpdate(id, updateScoreboardDto, options)
      .populate("level_core")

    if (!rubric_evaluation) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Cập nhật tiêu chí đánh giá thất bại!`,
        error: RUBRIC_EVALUTION.ERROR.UPDATE_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Cập nhật tiêu chí đánh giá thành công!",
      data: {
        rubric_evaluation
      }
    }
  }

  async remove(id: string) {
    this.validateUtils.validateObjectId(id);

    const rubric_evaluation: any = await this.rubricEvaluationModel.findById(id);

    if (!rubric_evaluation) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Tiêu chí đánh giá không tồn tại!`,
        error: RUBRIC_EVALUTION.ERROR.NOT_FOUND
      }, HttpStatus.BAD_REQUEST)
    }

    const rubric_id = rubric_evaluation.rubric_id;

    const usedRubric = await this.topicModel.findOne({
      $or: [
        { rubric_instructor: rubric_id },
        { rubric_reviewer: rubric_id },
        { rubric_assembly: rubric_id }
      ]
    })

    if (usedRubric) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Rubric này đã được sử dụng. Không được phép thực hiện hành động này!`,
        error: RUBRIC_EVALUTION.ERROR.ACTION_FORBIDDEN
      }, HttpStatus.BAD_REQUEST)
    }


    // Xóa tiêu chí đánh giá
    const result = await this.rubricEvaluationModel.findByIdAndDelete(id);
    if (!result) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Xóa tiêu chí đnhs giá thất bại!`,
        error: RUBRIC_EVALUTION.ERROR.DELETE_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    // Xóa tiêu chí đánh giá khỏi rubric
    await this.rubricModel.findByIdAndUpdate(
      rubric_evaluation.rubric_id,
      { $pull: { rubric_evaluations: rubric_evaluation._id } },
    )

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Xóa tiêu chí đánh giá thành công!",
        rubric_evaluation
      }
    }
  }
}
