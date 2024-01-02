import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTopicCategoryDto } from './dto/create-topic_categorydto';
import { UpdateTopicCategoryDto } from './dto/update-topic_category.dto';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ITopicCategory } from "./interface/topic_category.interface";
import { ValidateUtils } from "../../utils/validate.utils";
import { TOPIC_CATEGORY_CONSTANTS } from './constant/topic_category.constant';

@Injectable()
export class TopicCategoryService {
  constructor(@InjectModel('TopicCategory') private topicCategoryModel: Model<ITopicCategory>,
    private validateUtils: ValidateUtils) { }
  s
  async create(createTopicCategoryDto: CreateTopicCategoryDto) {

    const { topic_category_title } = createTopicCategoryDto;

    //Check TopicCategory exist
    const topicCategoryExist = await this.topicCategoryModel.findOne({ topic_category_title }).exec();
    if (topicCategoryExist) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Loại đề tài đã tồn tại!",
        error: TOPIC_CATEGORY_CONSTANTS.ERROR.EXISTED
      }, HttpStatus.BAD_REQUEST)
    }

    const newTopicCategory = await this.topicCategoryModel.create(createTopicCategoryDto);
    if (!newTopicCategory) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Thêm mới loại đề tài thất bại!",
        error: TOPIC_CATEGORY_CONSTANTS.ERROR.CREATED_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Thêm mới loại đề tài thành công!",
      data: {
        topic_category: newTopicCategory
      }
    }

  }

  async findAll() {
    const topic_categorys = await this.topicCategoryModel.find().lean().sort({ "topic_category_title": 1 });
    return {
      statusCode: HttpStatus.OK,
      message: "Lấy danh sách thể loại đề tài thành công!",
      data: {
        topic_categorys
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const topic_category = await this.topicCategoryModel.findById(id).lean();
    if (!topic_category) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Không tìm thấy loại đề tài với id: ${id}!`,
        error: TOPIC_CATEGORY_CONSTANTS.ERROR.NOT_FOUND
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy loại đề tài thành công!",
      data: {
        topic_category: topic_category
      }
    }

  }

  async update(id: string, updateTopicCategoryDto: UpdateTopicCategoryDto) {

    this.validateUtils.validateObjectId(id);

    const topicCategoryExist = await this.topicCategoryModel.findOne({
      _id: { $ne: id }, //không trùng id
      topic_category_title: updateTopicCategoryDto.topic_category_title
    });

    if (topicCategoryExist) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Loại đề tài đã tồn tại!",
        error: TOPIC_CATEGORY_CONSTANTS.ERROR.EXISTED
      }, HttpStatus.BAD_REQUEST)
    }

    const options = {
      new: true,
    };

    const topic_category = await this.topicCategoryModel.findByIdAndUpdate(id, updateTopicCategoryDto, options);

    if (!topic_category) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Cập nhật thất bại!`,
        error: TOPIC_CATEGORY_CONSTANTS.ERROR.UPDATE_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Cập nhật thành công!",
      data: {
        topic_category: topic_category
      }
    }
  }

  async remove(id: string) {

    this.validateUtils.validateObjectId(id);

    const topic_category = await this.topicCategoryModel.findByIdAndDelete(id).exec();

    if (!topic_category) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Xóa loại đề tàis thất bại!`,
        error: TOPIC_CATEGORY_CONSTANTS.ERROR.DELETE_FAIL
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Xóa loại đề tài thành công!",
      data: {
        topic_category: topic_category
      }
    }
  }

  async removeAll() {
    try {

      await this.topicCategoryModel.deleteMany()

      return {
        statusCode: HttpStatus.OK,
        message: "Xóa tất cả loại đề tài thành công!",
        data: {
        }
      }

    } catch (err) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Không thể xóa tất cả loại đề tài!",
        error: TOPIC_CATEGORY_CONSTANTS.ERROR.DELETE_FAIL
      }, HttpStatus.BAD_REQUEST)
    }
  }

}
