import { Document } from 'mongoose';

export interface IRubricEvaluation extends Document {

    readonly rubric_id: string;

    readonly serial: number;

    readonly evaluation_criteria: string;

    readonly grading_scale: number;

    readonly weight: number;

    readonly level_core: string;

    readonly note: string;
}