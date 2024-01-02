import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose';
import {Major} from "../../major/models/major.model";

@Schema({ timestamps: true})
export class Faculty {
    @Prop({
        required: true
    })
    faculty_title: string;

    @Prop()
    faculty_description: string;

    @Prop({
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Major' }],
            default: []
    })
    faculty_majors: Major[];

}
export const FacultySchema = SchemaFactory.createForClass(Faculty);
