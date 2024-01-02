import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose';
import { Assembly } from "../../assembly/models/assembly.model";
import { RegistrationPeriod } from "../../registration_period/models/registration_period.model";
import { TOPICS_CONSTANTS } from "../constant/topics.constant";

@Schema({ timestamps: true })
export class Topic {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "RegistrationPeriod",
        required: true,
    })
    topic_registration_period: string; // Đợt đăng ký

    @Prop({
        required: true,
        trim: true,
    })
    topic_title: string; // Tiêu đề của để tài

    @Prop({
        default: ""
    })
    topic_description: string; // Mô tả chi tiết đề tài


    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "TopicCategory",
    })
    topic_category: string; // Thể loại đề tài

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Major",
    })
    topic_major: string; // Topic thuộc chuyên ngành

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    })
    topic_creator: string; // Người tạo đề tài

    @Prop({
        default: 3
    })
    topic_max_members: number; // Số lượng thành viên tối đa

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GroupStudent' }],
        default: []
    })
    topic_group_student: string[] // Nhóm sinh viên thực hiện đề tài

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    })
    topic_instructor: string; // Người hướng dẫn

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    })
    topic_coInstructor: string; // Người đồng hướng dẫn

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    })
    topic_reviewer: string; // Người chấm phản biện

    @Prop({
        enum: Object.values(TOPICS_CONSTANTS.TEACHER_STATUS),
        default: TOPICS_CONSTANTS.TEACHER_STATUS.READY,
    })
    topic_teacher_status: string; // Trạng thái của đề tài đối với giảng viên

    @Prop({
        enum: Object.values(TOPICS_CONSTANTS.LEADER_STATUS),
        default: TOPICS_CONSTANTS.LEADER_STATUS.READY,
    })
    topic_leader_status: string; // Trạng thái của đề tài đối với trưởng ngành

    @Prop({
        trim: true,
        default: null
    })
    topic_advisor_request: string; // Đơn xin giảng viên hướng dẫn

    @Prop({
        trim: true,
        default: null
    })
    topic_final_report: string; // Đơn xin bảo vệ khóa luận tốt nghiệp

    @Prop({
        trim: true,
        default: null
    })
    topic_defense_request: string; // Báo cáo cuối cùng

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rubric",
        default: null
    })
    rubric_instructor: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rubric",
        default: null
    })
    rubric_reviewer: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rubric",
        default: null
    })
    rubric_assembly: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assembly",
        default: null
    })
    topic_assembly: string; // Hội đồng chấm KLTN

    @Prop({
        default: null
    })
    topic_room: string; // Phòng phản biện hội đồng

    @Prop({
        default: null
    })
    topic_time_start: string; // Thời gian bắt đầu phản biện hội đồng

    @Prop({
        default: null
    })
    topic_time_end: string; // Thời gian kết thúc phản biện hội đồng

    @Prop({
        default: null
    })
    topic_date: string;// Ngày phản biện hội đồng

    @Prop({
        type: Boolean,
        default: false
    })
    topic_block: boolean// Trạng thái đóng bảng điểm topics

}

export const TopicSchema = SchemaFactory.createForClass(Topic);
