import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { CreateSystemSettingDto } from './dto/create-system_setting.dto';
import { UpdateSystemSettingDto } from './dto/update-system_setting.dto';

import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ISSystemSetting } from "./interface/system_setting.interface";
import { ValidateUtils } from "../../utils/validate.utils";
import * as moment from 'moment';

import { SYSTEM_SETTING_CONSTANTS } from "./constant/system_setting.constant"


@Injectable()
export class SystemSettingService {
    constructor(@InjectModel("SystemSetting") private systemSettingModel: Model<ISSystemSetting>,
        private validateUtils: ValidateUtils) {
    }

    async create(createSystemSettingDto: CreateSystemSettingDto) {

        const system_setting = await this.systemSettingModel.create(createSystemSettingDto);
        if (!system_setting) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Tạo mới cài đặt hệ thống thất bại!",
                error: SYSTEM_SETTING_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            error: null,
            message: "Tạo mới cài đặt hệ thống thành công!",
            data: {
                system_setting: system_setting
            }
        }

    }

    async findOne(req: any) {

        let system_setting = null;
        system_setting = await this.systemSettingModel
            .findOne({})
            .limit(1)
            .populate("current_semester current_registration_period");

        if (!system_setting) {
            // Tạo cài đặt hệ thống với các giá trị mặt định
            const newSetting: any = await this.systemSettingModel.create();
            system_setting = await this.systemSettingModel.findById(newSetting._id)
                .populate("current_semester current_registration_period");
        }

        return {
            statusCode: HttpStatus.OK,
            error: null,
            message: "Lấy tất cài đặt hệ thống thành công!",
            data: {
                system_setting,
            }
        }
    }

    async update(id: string, updateSystemSettingDto: UpdateSystemSettingDto) {

        this.validateUtils.validateObjectId(id);

        const options = {
            new: true,
        };

        const system_setting = await this.systemSettingModel
            .findByIdAndUpdate(id, updateSystemSettingDto, options)
            .populate("current_semester current_registration_period");

        if (!system_setting) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Cập nhật cài đặt hệ thống thất bại!",
                error: SYSTEM_SETTING_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật cài đặt hệ thống thành công!",
            error: null,
            data: {
                system_setting
            }
        }

    }

}
