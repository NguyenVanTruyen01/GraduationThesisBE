import { Document } from 'mongoose';


export interface ITopic extends Document {

    readonly topic_registration_period: string;

    readonly topic_title: string;

    readonly topic_description: string;

    readonly topic_creator: string;

    readonly topic_max_members: number;

    readonly topic_group_student: string[];

    readonly topic_instructor: string;

    readonly topic_assembly: string;

    readonly topic_reviewer: string;

    readonly topic_teacher_status: string;

    readonly topic_leader_status: string;

    readonly topic_category: string;

    readonly topic_coInstructor: string;

    readonly topic_final_report: string;

    readonly rubric_instructor: string;

    readonly rubric_reviewer: string;

    readonly rubric_assembly: string;

    readonly topic_major: string;

    readonly topic_block: boolean;

    readonly topic_time_start: string;

    readonly topic_time_end: string;

}