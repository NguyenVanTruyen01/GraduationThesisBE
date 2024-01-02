import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose";
import { RUBRIC_CONSTANTS } from "../constant/rubric.constant";

@Schema({ timestamps: true })

export class Rubric {

    // Tiêu đề rubric
    @Prop({
        trim: true,
        default: '',
        required: true,
    })
    rubric_name: string;

    // Loại rubric
    @Prop({
        enum: Object.values(RUBRIC_CONSTANTS.RUBRIC_CATEGORY),
        default: null,
        required: true,
    })
    rubric_category: number;

    // Rubric cho loại đề tài
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "TopicCategory",
        default: null
    })
    rubric_topic_category: string;

    // Các tiêu chí đánh giá
    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RubricEvaluation' }]
    })
    rubric_evaluations: string[]

    // Ghi chú
    @Prop({
        trim: true,
        default: '',
    })
    rubric_note: string;

    // Link file mẫu
    @Prop({
        trim: true,
        default: '',
    })
    rubric_template: string;

}
export const RubricSchema = SchemaFactory.createForClass(Rubric);
