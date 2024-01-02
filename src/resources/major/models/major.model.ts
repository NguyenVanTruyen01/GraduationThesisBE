import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose';
import {Faculty} from "../../faculty/models/faculty.model";

@Schema({ timestamps: true})
export class Major {

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Faculty'
    })
    major_faculty: Faculty;

    @Prop({
        required: true
    })
    major_title: string;

    @Prop()
    major_description: string;

    @Prop({
        enum: ["ENGINEER","BACHELOR"],
        default: "ENGINEER"
    })
    training_system: string;

}
export const MajorSchema = SchemaFactory.createForClass(Major);
