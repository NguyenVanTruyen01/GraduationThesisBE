import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose";

@Schema({ timestamps: true })

export class RubricEvaluation {

    // id rubric
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rubric",
        default: null,
        require: true,
    })
    rubric_id: string;

    // Số thứ tự
    @Prop({
        default: null,
        required: true,
    })
    serial: number;

    // Tiêu chí đánh giá
    @Prop({
        default: '',
        required: true,
    })
    evaluation_criteria: string;

    // Thang điểm
    @Prop({
        default: null,
    })
    grading_scale: number;

    // Trọng số
    @Prop({
        default: null
    })
    weight: number;

    // Các mức độ hoàn thành
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "LevelScore",
        default: null
    })
    level_core: string;

    // ghi chú
    @Prop({
        trim: true,
        default: '',
    })
    note: string;

}
export const RubricEvaluationSchema = SchemaFactory.createForClass(RubricEvaluation);
