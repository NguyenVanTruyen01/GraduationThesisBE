import { Document } from 'mongoose';


export interface ISRegistrationPeriod extends Document {

    readonly registration_period_semester: string;

    readonly registration_period_start: number;

    readonly registration_period_end: number;

    readonly registration_period_status: boolean;

    readonly block_topic: boolean;

}