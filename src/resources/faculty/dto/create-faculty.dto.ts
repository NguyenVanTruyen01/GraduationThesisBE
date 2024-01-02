import {IsNotEmpty, IsString} from "class-validator";


export class CreateFacultyDto {

    @IsString()
    @IsNotEmpty()
    faculty_title: string;

    faculty_description: string;

    faculty_majors: string[];
}
