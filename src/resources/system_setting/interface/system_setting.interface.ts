import { Document } from 'mongoose';


export interface ISSystemSetting extends Document {

    readonly current_semester: string;

    readonly current_registration_period: string;

}