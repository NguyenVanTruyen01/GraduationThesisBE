import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import {SEMESTER_CONSTANTS} from "../constant/semester.constant"

@Schema({ timestamps: true})
export class Semester {
    @Prop({
        required:true,
        trim: true
    })
    school_year_start: string;

    @Prop({
        required:true,
        trim: true
    })
    school_year_end: string;

    @Prop({
        enum: Object.values(SEMESTER_CONSTANTS.SEMESTER),
        default: SEMESTER_CONSTANTS.SEMESTER.HK1,
        }
    )
    semester: string;

}
export const SemesterSchema = SchemaFactory.createForClass(Semester);
