import { IsNotEmpty, IsString, IsOptional } from "class-validator";

export class CreateGroupStudentDto {

    @IsString()
    @IsNotEmpty()
    group_name: string

    @IsNotEmpty()
    group_member: string[];

    @IsOptional() // Cho phép rỗng
    group_max_member: number;

}
