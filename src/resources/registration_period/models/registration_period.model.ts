import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { REGISTRATION_PERIOD_CONSTANTS } from "../constant/registration_period.constant"
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class RegistrationPeriod {

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        required: true,
        trim: true
    })
    registration_period_semester: string; // Học kì

    @Prop({
        required: true,
        trim: true
    })
    registration_period_start: number; // Thời gian bắt đầu

    @Prop({
        required: true,
        trim: true
    })
    registration_period_end: number; // Thời gian kết thúc

    @Prop({
        default: REGISTRATION_PERIOD_CONSTANTS.STATUS.INACTIVE,
    })
    registration_period_status: boolean; // Trạng thái đợt đăng ký

    @Prop({
        type: Boolean,
        default: false,
    })
    block_topic: boolean; // Thời gian kết thúc

}

export const RegistrationPeriodSchema = SchemaFactory.createForClass(RegistrationPeriod);