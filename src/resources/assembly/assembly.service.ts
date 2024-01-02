import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAssemblyDto } from './dto/create-assembly.dto';
import { UpdateAssemblyDto } from './dto/update-assembly.dto';
import { InjectModel } from "@nestjs/mongoose";
import { IAssembly } from "./interface/assembly.interface";
import { Model, Types } from "mongoose";
import { ValidateUtils } from "../../utils/validate.utils";

@Injectable()
export class AssemblyService {

  constructor(@InjectModel("Assembly") private assemblyModel: Model<IAssembly>,
    private validateUtils: ValidateUtils) {
  }

  async create(createAssemblyDto: CreateAssemblyDto) {

    const newAssembly = await this.assemblyModel.create(createAssemblyDto);

    if (!newAssembly) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Tạo mới hội đồng thất bại!",
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Tạo mới hội đồng thành công!",
      data: {
        assembly: newAssembly
      }
    }
  }

  async findAll() {
    const assemblies = await this.assemblyModel.find()
      .lean()
      .populate('chairman secretary members', '-password')

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy tất cả hội đồng thành công!",
      data: {
        assemblies
      }
    }
  }

  async findOne(id: string) {

    this.validateUtils.validateObjectId(id);

    const assembly = await this.assemblyModel.findById(id)
      .lean()
      .populate('chairman secretary members', '-password')

    if (!assembly) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Hội đồng không tồn tại!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy chi tiết hội đồng thành công!",
      data: {
        assembly
      }
    }
  }

  async update(id: string, updateAssemblyDto: UpdateAssemblyDto) {

    this.validateUtils.validateObjectId(id);

    const options = {
      new: true,
    };

    const assembly = await this.assemblyModel
      .findByIdAndUpdate(id, updateAssemblyDto, options)

    if (!assembly) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Hội đồng không tồn tại!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Cập nhật hội đồng thành công!",
      data: {
        assembly
      }
    }
  }

  async remove(id: string) {

    this.validateUtils.validateObjectId(id);

    const assembly = await this.assemblyModel.findByIdAndDelete(id).lean();

    if (!assembly) {
      throw new HttpException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: `Hội đồng không tồn tại!`,
        error: "Bad request!"
      }, HttpStatus.BAD_REQUEST)
    }

    return {
      statusCode: HttpStatus.OK,
      message: "Xóa hội đồng thành công!",
      data: {
        assembly
      }
    }
  }

  async leaderFindAllAssemblyOfTeacher(req: any) {

    const teacher_id = req.body.teacher_id;

    const assemblies = await this.assemblyModel.find({
      $or: [
        { chairman: teacher_id },
        { secretary: teacher_id },
        { members: { $in: [teacher_id] } },
      ],
    })
      .populate('chairman secretary members', '-password');

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy tất cả hội đồng của giảng viên thành công!",
      data: {
        assemblies
      }
    }
  }

  async teacherFindAllAssemblyOfTeacher(req: any) {

    const currentUserId = req.currentUser._id;

    const assemblies = await this.assemblyModel.find({
      $or: [
        { chairman: currentUserId },
        { secretary: currentUserId },
        { members: { $in: [currentUserId] } },
      ],
    })
      .populate('chairman secretary members', '-password');

    return {
      statusCode: HttpStatus.OK,
      message: "Lấy tất cả hội đồng của giảng viên thành công!",
      data: {
        assemblies
      }
    }
  }


}
