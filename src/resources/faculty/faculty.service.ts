import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IFaculty } from "./interface/faculty.interface";
import { ValidateUtils } from "../../utils/validate.utils";

@Injectable()
export class FacultyService {
  constructor(@InjectModel('Faculty') private facultyModel: Model<IFaculty>,
    private validateUtils: ValidateUtils) { }

  async create(createFacultyDto: CreateFacultyDto) {

    const { faculty_title } = createFacultyDto;

    //Check faculty exist
    const facultyExist = await this.facultyModel.findOne({ faculty_title }).exec();
    if (facultyExist) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Faculty existed!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    const newFaculty = await this.facultyModel.create(createFacultyDto);
    if (!newFaculty) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Can not create new faculty!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Create new faculty successfully!",
        faculty: newFaculty
      }
    }

  }

  async findAll() {
    const faculties = await this.facultyModel.find().lean().sort({ "faculty_title": 1 });
    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Get all faculty successfully!",
        faculties
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const faculty = await this.facultyModel.findById(id).lean();
    if (!faculty) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can't find faculty with id: ${id}!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Get faculty successfully!",
        faculty: faculty
      }
    }

  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto) {

    this.validateUtils.validateObjectId(id);

    const facultyExist = await this.facultyModel.findOne({
      _id: { $ne: id }, //không trùng id
      faculty_title: updateFacultyDto.faculty_title
    });

    if (facultyExist) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Faculty existed!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    const options = {
      new: true,
    };

    const faculty = await this.facultyModel.findByIdAndUpdate(id, updateFacultyDto, options);

    if (!faculty) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can't find faculty with id: ${id}!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Update faculty successfully!",
        faculty: faculty
      }
    }
  }

  async remove(id: string) {

    this.validateUtils.validateObjectId(id);

    const faculty = await this.facultyModel.findByIdAndDelete(id).exec();

    if (!faculty) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Can't find faculty with id: ${id}!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      data: {
        message: "Delete faculty successfully!",
        faculty: faculty
      }
    }
  }

  async removeAll() {
    try {

      await this.facultyModel.deleteMany()

      return {
        statusCode: HttpStatus.OK,
        data: {
          message: "Delete all faculty successfully!",
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
