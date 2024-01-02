import { Document } from 'mongoose';

export interface IFaculty extends Document{
    readonly faculty_title: string;
    readonly faculty_description: string;
    readonly faculty_majors: string[];
}