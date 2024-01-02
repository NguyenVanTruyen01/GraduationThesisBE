import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class ScoreBoard {

    // Template chấm điểm
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Rubric",
        default: null,
        required: true
    })
    rubric_id: string;

    @Prop({
        default: null,
        required: true
    })
    rubric_category: number;

    // Id topic
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        default: null,
        required: true
    })
    topic_id: string;

    // Người chấm điểm
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
        required: true
    })
    grader: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
    })
    student_id: string;

    @Prop({
        type: [{
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            student_score: { type: Number, default: null },
        }],
        default: []
    })
    student_grades: Record<string, any>;

    @Prop({
        type: [{
            total_evaluation_id: { type: mongoose.Schema.Types.ObjectId, ref: "RubricEvaluation" },
            total_evaluation_score: { type: Number, default: null },
        }],
        default: []
    })
    rubric_total_evaluations: Record<string, any>;

    @Prop({
        type: [{
            evaluation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'RubricEvaluation' },
            evaluation_score: { type: Number, default: null },
        }],
        default: [],
    })
    rubric_student_evaluations: Record<string, any>;

    @Prop({
        default: null,
    })
    total_score: number;
}
export const ScoreBoardSchema = SchemaFactory.createForClass(ScoreBoard);
