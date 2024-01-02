import { Document } from 'mongoose';

export interface ILevelScore extends Document{
    readonly level_id: number;
    readonly level_title: string;
    readonly level_value: number;
}