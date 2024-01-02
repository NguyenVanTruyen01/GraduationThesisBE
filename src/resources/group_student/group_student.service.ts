import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateGroupStudentDto } from './dto/create-group_student.dto';
import { UpdateGroupStudentDto } from './dto/update-group_student.dto';
import { InjectModel } from "@nestjs/mongoose";
import { IGroupStudent } from "./interface/group_student.interface";
import { Model } from "mongoose";
import { IUser } from "../users/interface/user.interface";
import { ValidateUtils } from "../../utils/validate.utils";
import { GROUP_STUDENT_CONSTANTS } from "./constant/group_student.constant"

@Injectable()
export class GroupStudentService {

    constructor(
        @InjectModel("GroupStudent") private groupStudentModel: Model<IGroupStudent>,
        @InjectModel("User") private userModel: Model<IUser>,
        private validateUtils: ValidateUtils) {
    }

    async create(createGroupStudentDto: CreateGroupStudentDto) {

        const { group_member } = createGroupStudentDto

        //create group
        const group_student = await this.groupStudentModel.create(createGroupStudentDto);
        if (!group_student) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Can not create new group student!",
                error: GROUP_STUDENT_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        // Thêm ID nhóm vào từng thành viên trong model người dùng
        await this.userModel.updateMany(
            { _id: { $in: group_member } },
            { $push: { user_group_students: group_student._id } },
        );

        return {
            statusCode: HttpStatus.OK,
            data: {
                message: "Create new group student successfully!",
                group_student
            }
        }
    }

    async findAll() {
        const group_students = await this.groupStudentModel.find()
            .populate("group_member", "-password")
            .lean();

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy tất cả các nhóm sinh viên thành công!",
            error: null,
            data: {
                group_students
            }
        }
    }

    async getManyGroupStudent(req) {
        try {
            const { group_student_ids } = req.body;

            const group_students: any = await this.groupStudentModel
                .find({ _id: { $in: group_student_ids } })
                .populate({
                    path: 'group_member',
                    select: '_id email user_id user_name user_avatar user_phone user_faculty',
                    populate: {
                        path: 'user_faculty user_major'
                    }
                })

            if (!group_students || group_students.length <= 0) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Lấy danh sách nhóm sinh viên thất bại!",
                    error: GROUP_STUDENT_CONSTANTS.ERROR.NOT_FOUND
                }, HttpStatus.BAD_REQUEST)
            }

            return {
                statusCode: HttpStatus.OK,
                message: "Lấy danh sách nhóm sinh viên thành công!",
                error: null,
                data: {
                    group_students
                }
            }
        } catch (error) {
            throw new HttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi khi lấy danh sách nhóm sinh viên",
                error: "Bad request!"
            }, HttpStatus.BAD_REQUEST)
        }
    }

    async findOne(id: string) {

        this.validateUtils.validateObjectId(id);

        const group_student = await this.groupStudentModel
            .findById(id)
            .populate("group_member", "-password")
            .lean();

        if (!group_student) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Nhóm sinh viên không tồn tại!`,
                error: GROUP_STUDENT_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy chi tiết nhóm sinh viên thành công!",
            error: null,
            data: {
                group_student
            }
        }
    }

    async update(id: string, updateGroupStudentDto: UpdateGroupStudentDto) {

        this.validateUtils.validateObjectId(id);

        const options = {
            new: true,
        };

        const group_student = await this.groupStudentModel.findByIdAndUpdate(id, updateGroupStudentDto, options)
            .populate("group_member")
            .lean();
        if (!group_student) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Cập nhật thất bại!",
                error: GROUP_STUDENT_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật thành công!",
            error: null,
            data: {
                group_student
            }
        }
    }

    async addMembers(id: string, @Body() idsMember: any) {

        this.validateUtils.validateObjectId(id);

        const { ids_member } = idsMember

        const options = {
            new: true,
        };

        const group_student = await this.groupStudentModel
            .findByIdAndUpdate(id, {
                $push: { group_member: { $each: ids_member } }
            }, options)
            .populate("group_member", "-password")
            .lean();

        if (!group_student) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể thêm sinh viên vào nhóm!",
                error: GROUP_STUDENT_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Thêm sinh viên vào nhóm thành công!",
            error: null,
            data: {
                group_student
            }
        }
    }

    async removeMembers(id: string, idsMember: any) {

        this.validateUtils.validateObjectId(id);

        const { ids_member } = idsMember

        const options = {
            new: true,
        };

        const group_student = await this.groupStudentModel
            .findByIdAndUpdate(id, {
                $pull: { group_member: { $in: ids_member } }
            }, options)
            .populate("group_member", "-password")
            .lean();

        if (!group_student) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "không thể xóa sinh khỏi nhóm!",
                error: GROUP_STUDENT_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa sinh viên khỏi nhóm thành công!",
            error: null,
            data: {
                group_student
            }
        }
    }

    async remove(id: string) {

        this.validateUtils.validateObjectId(id);

        const group_student = await this.groupStudentModel.findByIdAndDelete(id).exec();

        if (!group_student) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "không thể xóa nhóm sinh viên!",
                error: GROUP_STUDENT_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa nhóm sinh viên thành công!",
            error: null,
            data: {
                group_student
            }
        }
    }

}
