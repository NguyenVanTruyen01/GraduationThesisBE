import { Document } from 'mongoose';

export interface IGroupStudent{
    readonly group_name: string;
    readonly group_member: string[];
}