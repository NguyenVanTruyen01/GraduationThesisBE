import { Document } from 'mongoose';

export interface IRubric extends Document {

    readonly rubric_name: string;

    readonly rubric_category: number;

    readonly rubric_topic_category: string;

    readonly rubric_evaluations: string[];

    readonly rubric_note: string;

    readonly rubric_template: string;

}