import { Document } from 'mongoose';


export interface ISemester extends Document{

    readonly school_year_start: string;

    readonly school_year_end: string;

    readonly semester: string;

}