import { Document } from 'mongoose';

export interface IAssembly extends Document {
    readonly assembly_major: string;
    readonly chairman: string;
    readonly secretary: string;
    readonly members: string;
    readonly assembly_name: string;
}