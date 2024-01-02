import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateMajorDto } from './dto/create-major.dto';
import { UpdateMajorDto } from './dto/update-major.dto';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IMajor } from "./interface/major.interface";
import { Faculty } from "../faculty/models/faculty.model";
import { ValidateUtils } from "../../utils/validate.utils";

@Injectable()
export class MajorService {

  constructor(@InjectModel("Major") private majorModel: Model<IMajor>,
    @InjectModel("Faculty") private facultyModel: Model<Faculty>,
    private validateUtils: ValidateUtils) {
  }

  async create(createMajorDto: CreateMajorDto) {
    const { major_title, major_faculty } = createMajorDto

    // Check major exist
    const majorExist = await this.majorModel.findOne({ major_title }).lean()
    if (majorExist) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Major existed!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    //Create new major
    const newMajor = await this.majorModel.create(createMajorDto)
    if (!newMajor) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can't create new major!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    //Add major into faculty
    await this.facultyModel.findByIdAndUpdate(major_faculty, { $push: { faculty_majors: newMajor } })

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Create new major successfully!",
        major: newMajor
      }
    }

  }

  async findAll() {
    const majors = await this.majorModel.find().populate("major_faculty", "_id faculty_title").lean()
    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Get all major successfully!",
        majors
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const major = await this.majorModel.findById(id).populate("major_faculty", "_id faculty_title").lean()

    if (!major) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can not find major with id: ${id} `,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Get a major successfully!",
        major
      }
    }
  }

  async update(id: string, updateMajorDto: UpdateMajorDto) {

    this.validateUtils.validateObjectId(id);

    const options = {
      new: true,
    };

    const major = await this.majorModel.findByIdAndUpdate(id, updateMajorDto, options);

    if (!major) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can't find major with id: ${id}!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Update major successfully!",
        major
      }
    }
  }

  async remove(id: string) {

    this.validateUtils.validateObjectId(id);

    const major = await this.majorModel.findByIdAndDelete(id).lean().exec();

    if (!major) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can't find major with id: ${id}!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    await this.facultyModel.findByIdAndUpdate(major.major_faculty, {
      $pull: {
        faculty_majors: id,
      }
    })

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Delete major successfully!",
        major
      }
    }

  }

  async removeAll() {
    try {
      await this.majorModel.deleteMany()

      await this.facultyModel.updateMany({}, { $set: { faculty_majors: [] } })

      return {
        statusCode: HttpStatus.OK,
        data: {
          message: "Delete all major successfully!",
        }
      }

    } catch (err) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Can not delete all faculty!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }
  }
}
