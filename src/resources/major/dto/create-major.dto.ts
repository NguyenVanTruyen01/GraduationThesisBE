import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateMajorDto {

    @IsString()
    @IsNotEmpty()
    major_title: string;

    @IsOptional()
    major_description: string;

    @IsNotEmpty()
    major_faculty: string;

    @IsOptional()
    training_system: string;
}
