import {IsDateString, IsIn, IsNotEmpty, IsString, validateSync} from "class-validator";
import {SEMESTER_CONSTANTS} from "../constant/semester.constant";

export class CreateSemesterDto {

    @IsDateString()
    @IsNotEmpty()
    school_year_start: string;

    @IsDateString()
    @IsNotEmpty()
    school_year_end: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(Object.values(SEMESTER_CONSTANTS.SEMESTER))
    semester: string;

}
