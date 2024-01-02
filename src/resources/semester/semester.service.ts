import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ISemester } from "./interface/semester.interface";
import { ValidateUtils } from "../../utils/validate.utils";
import { SEMESTER_CONSTANTS } from "./constant/semester.constant"
import { ISRegistrationPeriod } from '../registration_period/interface/registration_period.interface';

@Injectable()
export class SemesterService {
    constructor(
        @InjectModel("Semester") private semesterModel: Model<ISemester>,
        @InjectModel("RegistrationPeriod") private registrationPeriodModel: Model<ISRegistrationPeriod>,
        private validateUtils: ValidateUtils) {
    }

    async create(createSemesterDto: CreateSemesterDto) {

        const { school_year_start, school_year_end, semester } = createSemesterDto;

        //  Check semester existed
        const semesterExist = await this.semesterModel.findOne({
            $and: [
                { "school_year_start": school_year_start },
                { "school_year_end": school_year_end },
                { "semester": semester }
            ]
        })

        if (semesterExist) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Học kỳ đã tồn tại!",
                error: SEMESTER_CONSTANTS.ERROR.EXISTED
            }, HttpStatus.BAD_REQUEST)
        }

        const newSemester = await this.semesterModel.create(createSemesterDto);
        if (!newSemester) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Tạo mới học kỳ thất bại!",
                error: SEMESTER_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Tạo mới học kỳ thành công!",
            error: null,
            data: {
                semester: newSemester
            }
        }

    }

    async findAll() {
        const semesters = await this.semesterModel.find().sort({ "school_year_start": 1 });
        return {
            statusCode: HttpStatus.OK,
            message: "Lấy tất cả học kỳ thành công!",
            error: null,
            data: {
                semesters
            }
        }
    }

    async findOne(id: string) {

        this.validateUtils.validateObjectId(id);

        const semester = await this.semesterModel.findById(id).lean();
        if (!semester) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Không tìm thấy học kỳ với id: ${id}`,
                error: SEMESTER_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy học kỳ thành công!",
            error: null,
            data: {
                semester
            }
        }
    }

    async update(id: string, updateSemesterDto: UpdateSemesterDto) {

        this.validateUtils.validateObjectId(id);

        //  Check semester existed
        const semesterExist = await this.semesterModel.findOne({
            _id: { $ne: id }, //không trùng id
            $and: [
                { "school_year_start": updateSemesterDto.school_year_start },
                { "school_year_end": updateSemesterDto.school_year_end },
                { "semester": updateSemesterDto.semester }
            ]
        })

        if (semesterExist) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Học kỳ này đã tồn tại!",
                error: SEMESTER_CONSTANTS.ERROR.EXISTED
            }, HttpStatus.BAD_REQUEST)
        }

        const options = {
            new: true,
        };

        const semester = await this.semesterModel.findByIdAndUpdate(id, updateSemesterDto, options);
        if (!semester) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể cập nhật học kỳ này!",
                error: SEMESTER_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật học kỳ thành công!",
            error: null,
            data: {
                semester
            }
        }

    }

    async remove(id: string) {

        this.validateUtils.validateObjectId(id);

        const registration = await this.registrationPeriodModel.findOne({
            registration_period_semester: id
        })

        if (registration) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Có đợt đăng ký trong kỳ. Không thể xóa học kỳ này!",
                error: SEMESTER_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        const semester = await this.semesterModel.findByIdAndDelete(id).lean().exec();

        if (!semester) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể xóa học kỳ này!",
                error: SEMESTER_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa học kỳ thành công!",
            error: null,
            data: {
                semester
            }
        }
    }

    async removeAll() {
        await this.semesterModel.deleteMany({})
        return {
            statusCode: HttpStatus.OK,
            message: "Xóa tất cả học kỳ thành công!",
            error: null,
            data: {}
        }
    }
}
