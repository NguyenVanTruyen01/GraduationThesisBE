import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateSystemSettingDto {

    @IsString()
    @IsOptional() // Cho phép rỗng
    current_semester: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    current_registration_period: string;

}