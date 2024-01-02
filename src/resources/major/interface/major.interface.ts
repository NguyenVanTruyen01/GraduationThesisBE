import { Document } from 'mongoose';

export interface IMajor extends Document{
    readonly major_title: string;
    readonly major_description: string;
    readonly major_faculty: string;
    readonly training_system: string;
}