import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ISRegistrationPeriod } from '../interface/registration_period.interface';
import * as moment from 'moment';

@Injectable()
export class RegistrantionPeriodCronJob {
    constructor(
        @InjectModel("RegistrationPeriod") private registrationPeriodModel: Model<ISRegistrationPeriod>
    ) { }

    // Chạy vào lúc 0h1p
    @Cron('0 0 1 * * *')
    async handleOpenRegistrationPeriod() {

        console.info('START OPEN REGISTRATION PERIOD')

        let currentDate: any = +moment().format('YYYYMMDD');

        // Tìm xem trong thời gian này có đợt đăng ký nào đang mở không
        let currentRegistrationPeriod = await this.registrationPeriodModel.find({
            registration_period_status: true
        })

        if (currentRegistrationPeriod.length <= 0) {

            // Kiểm tra có đợt đăng ký nào được tạo trước không
            let openRegistrationPeriod = await this.registrationPeriodModel.find({
                registration_period_start: currentDate,
                registration_period_status: false,
            })

            // Có thì mở đợt đang ký
            if (openRegistrationPeriod && openRegistrationPeriod.length > 0) {
                await this.registrationPeriodModel.findByIdAndUpdate(
                    openRegistrationPeriod[0]._id,
                    {
                        registration_period_status: true,
                    }
                )
            }
        }

        console.info('OPEN REGISTRATION PERIOD SUCCESSFUL')
    }

    // Chạy vào lúc 23h55
    @Cron('0 55 23 * * *')
    async handleCloseRegistrationPeriod() {

        console.info('START CLOSE REGISTRATION PERIOD')

        let currentDate: any = +moment().format('YYYYMMDD');

        // Kiểm tra có đợt đăng ký nào hạn đóng làm hôm nay không
        let closeRegistrationPeriod = await this.registrationPeriodModel.find({
            registration_period_end: currentDate,
            registration_period_status: true,
        })

        // Có thì đóng đợt đăng ký
        if (closeRegistrationPeriod && closeRegistrationPeriod.length > 0) {
            await this.registrationPeriodModel.findByIdAndUpdate(
                closeRegistrationPeriod[0]._id,
                {
                    registration_period_status: false,
                }
            )
        }

        console.info('CLOSE REGISTRATION PERIOD SUCCESSFUL')

    }
}