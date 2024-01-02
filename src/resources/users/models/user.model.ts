import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose";
import { USER_CONSTANTS } from "../constant/users.constant"

@Schema({ timestamps: true })
export class User {
    @Prop({
        required: true,
        unique: true,
    })
    email: string;

    @Prop({
        required: true,
    })
    password: string;

    @Prop({
        required: true,
        trim: true,
        unique: true
    })
    user_id: string;

    @Prop({
        trim: true,
        required: false, // Cho phép giá trị không bắt buộc
        default: null,
    })
    user_CCCD: string;

    @Prop({
        required: true,
        trim: true
    })
    user_name: string;

    @Prop({
        default: "djashdhjasghjdgshjadg"
    })
    user_avatar: string;

    @Prop({
        required: true,
    })
    user_date_of_birth: string;

    @Prop({
        required: true,
        trim: true,
        maxLength: 10,
        minLength: 10
    })
    user_phone: string;

    //Địa chỉ thường trú
    @Prop({
        trim: true
    })
    user_permanent_address: string;

    //Địa chỉ tạm trú
    @Prop()
    user_temporary_address: string;

    //Student: lớp
    //Teacher: phòng làm việc
    @Prop()
    user_department: string;

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty"
    })
    user_faculty: string; // Khoa

    @Prop({
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "Major"
    })
    user_major: string; // Chuyên ngành

    @Prop({
        enum: Object.values(USER_CONSTANTS.ROLE),
    })
    role: string;

    @Prop({
        default: USER_CONSTANTS.ACCOUNT_STATUS.ACTIVE
    })
    user_status: boolean;

    @Prop({
        default: null
    })
    user_average_grade: number; // Điểm trung bình của sinh viên

    @Prop({
        default: null
    })
    user_transcript: string;// Bảng điểm của sinh viên

}

export const UserSchema = SchemaFactory.createForClass(User);

// Bỏ trường password khi lấy dữ liệu
UserSchema.set('toJSON', {
    transform: function (doc, ret, opt) {
        delete ret['password']
        return ret
    }
})