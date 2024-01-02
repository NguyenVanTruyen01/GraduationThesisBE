import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { SYSTEM_SETTING_CONSTANTS } from "../constant/system_setting.constant"
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class SystemSetting {

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Semester",
        trim: true,
        default: null
    })
    current_semester: string; // Học kì

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegistrationPeriod",
        trim: true,
        default: null
    })
    current_registration_period: string; // Đợt đăng ký

}

export const SystemSettingSchema = SchemaFactory.createForClass(SystemSetting);