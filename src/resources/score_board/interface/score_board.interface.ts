import { Document } from 'mongoose';

export interface IScoreBoard extends Document {

    readonly rubric_id: string;

    readonly rubric_category: number;

    readonly topic_id: string;

    readonly grader: string;

    readonly student_id: string;

    readonly student_grades: any[];

    readonly rubric_total_evaluations: any[];

    readonly rubric_student_evaluations: any[];

    readonly total_score: number;
}