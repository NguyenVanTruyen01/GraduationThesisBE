import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateScoreBoardDto } from './dto/create-score_board.dto';
import { UpdateScoreBoardDto } from './dto/update-score_board.dto';
import { InjectModel } from "@nestjs/mongoose";
import { connections, Model } from "mongoose";
import { IScoreBoard } from "./interface/score_board.interface";
import { ValidateUtils } from "../../utils/validate.utils";
import { ScoreBoardFunction } from "./score_board.function";
import { ISRegistrationPeriod } from '../registration_period/interface/registration_period.interface';
import { ITopic } from '../topics/interface/topic.interface';

@Injectable()
export class ScoreBoardService {
  constructor(
    @InjectModel("ScoreBoard") private scoreBoardModel: Model<IScoreBoard>,
    @InjectModel("RegistrationPeriod") private registrationPeriodModel: Model<ISRegistrationPeriod>,
    @InjectModel("Topic") private topicModel: Model<ITopic>,
    private validateUtils: ValidateUtils,
    private scoreBoardFunction: ScoreBoardFunction,
  ) { }

  async create(createScoreBoardDto: CreateScoreBoardDto) {

    const scoreboard = await this.scoreBoardModel.create(createScoreBoardDto);
    if (!scoreboard) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Tạo bảng điểm thất bại!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Tạo bảng điểm thành công!",
        scoreboard
      }
    }

  }

  async findAll() {
    const scoreboards = await this.scoreBoardModel.find()
      .populate('topic_id grader student_id student_grades.user_id rubric_student_evaluations.evaluation_id')
      .lean()

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Get all score successfully!",
        scoreboards
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const scoreboard = await this.scoreBoardModel.findById(id)
      .populate('topic_id grader student_id student_grades.user_id rubric_student_evaluations.evaluation_id')
      .lean()


    if (!scoreboard) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Bảng điểm không tồn tại!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy chi tiết bảng điểm thành công!",
      data: {
        scoreboard
      }
    }
  }

  async getScoreBoardByFilter(req) {

    const currentUserId = req.currentUser._id;

    const filter = req.body.filter;
    const rubric_category = filter.rubric_category;
    const student_id = filter.student_id;
    const topic_id = filter.topic_id;
    const grader = filter.grader;

    let rubrics: any = null;

    rubrics = await this.scoreBoardModel
      .findOne(filter)
      .populate('topic_id grader student_id student_grades.user_id rubric_student_evaluations.evaluation_id')
      .lean()

    if (!rubrics && (grader && grader === currentUserId)) {
      // Nếu chưa có rubrics thì tạo mới với giá trị mặc định
      if (!rubrics || rubrics.length <= 0) {
        if (rubric_category && rubric_category === 1) {
          const scoreboard = await this.scoreBoardFunction.createScoreBoardInstructor(topic_id, student_id)
          rubrics = await this.scoreBoardModel
            .findById(scoreboard._id)
            .populate('topic_id grader student_id student_grades.user_id rubric_student_evaluations.evaluation_id')
            .lean()
        }

        if (rubric_category && rubric_category === 2) {
          const scoreboard = await this.scoreBoardFunction.createScoreBoardReviewer(topic_id, student_id)
          rubrics = await this.scoreBoardModel
            .findById(scoreboard._id)
            .populate('topic_id grader student_id student_grades.user_id rubric_student_evaluations.evaluation_id')
            .lean()
        }

        if (rubric_category && rubric_category === 3) {
          const scoreboard = await this.scoreBoardFunction.createScoreBoardAssembly(topic_id, student_id, currentUserId)
          rubrics = await this.scoreBoardModel
            .findById(scoreboard._id)
            .populate('topic_id grader student_id student_grades.user_id rubric_student_evaluations.evaluation_id')
            .lean()
        }
      }
    }

    if (!rubrics) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Chưa có bảng điểm!",
        error: "NOT_FOUND"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy danh sách bảng điểm thành công!",
      error: null,
      data: {
        rubrics
      }
    }
  }

  async getManyScoreBoardsOfStudent(req) {

    const filter = req.body.filter;

    let rubrics: any = null;

    rubrics = await this.scoreBoardModel
      .find(filter)
      .populate('topic_id grader student_id student_grades.user_id rubric_student_evaluations.evaluation_id')
      .lean()

    const scoreboards = await this.processInputToOutput(rubrics);

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy danh sách bảng điểm thành công!",
      error: null,
      data: {
        scoreboards
      }
    }
  }

  async processInputToOutput(input: any) {

    let output = {
      rubric_id: input[0].rubric_id,
      rubric_category: input[0].rubric_category,
      topic_id: input[0].topic_id,
      student_id: input[0].student_id,
      scoreboards: [],
      total_scoreboard: [],
    };

    const evaluations = input[0].rubric_student_evaluations;

    // Process scoreboards
    evaluations.forEach((evaluation: any) => {

      let scoreboard = {
        evaluation: evaluation.evaluation_id,
        marks: [],
      }

      const evaluation_id = evaluation.evaluation_id._id;

      input.forEach((scoreboardItem: any) => {

        let mark = {
          grader: scoreboardItem.grader,
          evaluation_score: null,
        }

        scoreboardItem.rubric_student_evaluations.forEach((score: any) => {
          if (score.evaluation_id._id == evaluation_id) {
            mark.evaluation_score = score.evaluation_score;
            scoreboard.marks.push(mark);
          }
        })

      })

      output.scoreboards.push(scoreboard);

    });

    // Process total_scoreboard
    input.forEach((scoreboard) => {
      const processedTotalScore = {
        grader: scoreboard.grader,
        total_score: scoreboard.total_score,
      };

      output.total_scoreboard.push(processedTotalScore);
    });

    return output;
  }

  async update(req, id: string, updateScoreBoardDto: UpdateScoreBoardDto) {

    this.validateUtils.validateObjectId(id);
    const currentUserId = req.currentUser._id;

    const existedScoreBoard: any = await this.scoreBoardModel.findById(id);

    if (!existedScoreBoard) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Bảng điểm không tồn tại!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    if (currentUserId != existedScoreBoard.grader) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Không được phép thực hiện hành động này!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    const topic = await this.topicModel.findById(existedScoreBoard.topic_id);
    if (topic && topic.topic_block) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Bảng điểm đã bị khóa, không thể cập nhật bảng điểm!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    const options = {
      new: true,
    };

    const scoreboard = await this.scoreBoardModel.findByIdAndUpdate(id, updateScoreBoardDto, options);

    if (!scoreboard) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Cập nhật thất bại!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Cập nhật bảng điểm thành công!",
      data: {
        scoreboard
      }
    }

  }

  async studentGetScoreBoardByFilter(req) {

    const filter = req.body.filter;

    let rubrics: any = await this.scoreBoardModel
      .findOne(filter)
      .populate('topic_id')
      .populate('grader student_id', '-password')
      .select("-rubric_total_evaluations -rubric_student_evaluations")
      .lean()

    if (!rubrics) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Chưa có bảng điểm!",
        error: "NOT_FOUND"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy danh sách bảng điểm thành công!",
      error: null,
      data: {
        rubrics
      }
    }
  }

  async adminBlockScores(req) {

    const registration_period = req.body.registration_period;
    const block_topic = req.body.block_topic;

    await this.registrationPeriodModel.findByIdAndUpdate(
      registration_period, {
      block_topic: block_topic
    })

    const topics = await this.topicModel.updateMany({
      topic_registration_period: registration_period
    },
      {
        topic_block: block_topic
      }
    )

    return {
      statusCode: HttpStatus.OK,
      message: "Cập nhật trạng thái thành công!",
      error: null,
      data: "success"
    }
  }
}
