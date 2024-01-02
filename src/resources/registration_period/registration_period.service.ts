import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateRegistrationPeriodDto } from './dto/create-registration_period.dto';
import { UpdateRegistrationPeriodDto } from './dto/update-registration_period.dto';

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ISRegistrationPeriod } from "./interface/registration_period.interface";
import { ValidateUtils } from "../../utils/validate.utils";
import * as moment from 'moment';

import { REGISTRATION_PERIOD_CONSTANTS } from "./constant/registration_period.constant"
import { ITopic } from '../topics/interface/topic.interface';


@Injectable()
export class RegistrationPeriodService {
    constructor(
        @InjectModel("RegistrationPeriod") private registrationPeriodModel: Model<ISRegistrationPeriod>,
        @InjectModel("Topic") private topicModel: Model<ITopic>,
        private validateUtils: ValidateUtils
    ) {
    }

    async create(createRegistrationPeriodDto: CreateRegistrationPeriodDto) {

        const {
            registration_period_semester,
            registration_period_start,
            registration_period_end,
            registration_period_status
        } = createRegistrationPeriodDto;

        //  Kiểm tra đợt đăng ký đã tồn tại
        const registrationPeriodExist = await this.registrationPeriodModel.findOne({
            $and: [
                { "registration_period_semester": registration_period_semester },
                { "registration_period_start": registration_period_start },
                { "registration_period_end": registration_period_end }
            ]
        })

        if (registrationPeriodExist) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đợt đăng ký đã tồn tại!",
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.REGISTRATION_PERIOD_EXISTED
            }, HttpStatus.BAD_REQUEST)
        }

        const newRegistrationPeriod = await this.registrationPeriodModel.create(createRegistrationPeriodDto);
        if (!newRegistrationPeriod) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Tạo mới đợt đăng ký thất bại!",
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            error: null,
            message: "Tạo mới đợt đăng ký thành công!",
            data: {
                semester: newRegistrationPeriod
            }
        }

    }

    async findAll(skip: number, limit: number) {

        const registration_period = await this.registrationPeriodModel
            .find()
            .skip(skip)
            .limit(limit)
            .sort({ "registration_period_start": 1 })
            .populate("registration_period_semester");

        // Sử dụng countDocuments() để đếm tổng số lượng bản ghi
        const total = await this.registrationPeriodModel.countDocuments();

        return {
            statusCode: HttpStatus.OK,
            error: null,
            message: "Lấy tất cả đợt đăng ký thành công!",
            data: {
                registration_period,
                total
            }
        }
    }

    async findOne(id: string) {

        this.validateUtils.validateObjectId(id);

        const registration_period = await this.registrationPeriodModel
            .findById(id)
            .populate("registration_period_semester")
            .lean();

        if (!registration_period) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Can not get registration period with id: ${id}`,
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Get registration period successfully!",
            data: {
                registration_period
            }
        }
    }

    async update(id: string, updateRegistrationPeriodDto: UpdateRegistrationPeriodDto) {

        this.validateUtils.validateObjectId(id);
        const {
            registration_period_semester,
            registration_period_start,
            registration_period_end,
            registration_period_status
        } = updateRegistrationPeriodDto

        //  Check semester existed
        const registrationPeriodExist = await this.registrationPeriodModel.findOne({
            _id: { $ne: id }, //không trùng id
            $and: [
                { "registration_period_semester": registration_period_semester },
                { "registration_period_start": registration_period_start },
                { "registration_period_end": registration_period_end },
                { "registration_period_status": registration_period_status }
            ]
        })

        if (registrationPeriodExist) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đợt đăng ký đã tồn tại!",
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.REGISTRATION_PERIOD_EXISTED
            }, HttpStatus.BAD_REQUEST)
        }

        const options = {
            new: true,
        };

        const registration_period = await this.registrationPeriodModel
            .findByIdAndUpdate(id, updateRegistrationPeriodDto, options)
            .populate("registration_period_semester")

        if (!registration_period) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể cập nhật đợt đăng ký này!",
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật đợt đăng ký thành công!",
            error: null,
            data: {
                registration_period
            }
        }

    }

    async remove(id: string) {

        this.validateUtils.validateObjectId(id);

        const topic = await this.topicModel.findOne({
            topic_registration_period: id
        })
        if (topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Có đề tài trong đợt đăng ký. Không thể xóa đợt đăng ký này!",
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        const registration_period = await this.registrationPeriodModel.findByIdAndDelete(id).lean().exec();

        if (!registration_period) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể xóa đợt đăng ký này!",
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            error: null,
            message: "Xóa đợt đăng ký thành công!",
            data: {
                registration_period
            }
        }
    }

    async removeAll() {
        await this.registrationPeriodModel.deleteMany({})
        return {
            statusCode: HttpStatus.OK,
            error: null,
            message: "Xóa ất cả các đợt đăng ký thành công!",
            data: {}
        }
    }

    async getCurrentRegistrationPeriod() {

        const currentDate = +moment().format(REGISTRATION_PERIOD_CONSTANTS.FORMAT_DATE.FORMAT_DB);

        const registration_period = await this.registrationPeriodModel.findOne({
            registration_period_start: { $lte: currentDate },
            registration_period_end: { $gte: currentDate },
            registration_period_status: REGISTRATION_PERIOD_CONSTANTS.STATUS.ACTIVE,
        })
            .populate("registration_period_semester")
            .exec();

        if (!registration_period) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Hiện tại chưa có đợt đăng ký nào được mở!",
                error: REGISTRATION_PERIOD_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            error: null,
            message: "Lấy đợt đăng ký đăng ký thành công!",
            data: {
                registration_period
            }
        }

    }


    async leaderGetRegistrationPeriodByFilter(req: any) {

        const filter = req.body.filter;

        const registration_periods = await this.registrationPeriodModel
            .find(filter)
            .populate("registration_period_semester")
            .lean()

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đợt đăng ký thành công!",
            error: null,
            data: {
                registration_periods
            }
        }
    }

}
