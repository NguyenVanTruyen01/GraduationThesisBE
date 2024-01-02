import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateRegistrationPeriodDto {

    @IsString()
    @IsNotEmpty()
    registration_period_semester: string;

    @IsNumber()
    @IsNotEmpty()
    registration_period_start: number;

    @IsNumber()
    @IsNotEmpty()
    registration_period_end: number;

    @IsBoolean()
    @IsOptional() // Cho phép rỗng
    registration_period_status: boolean;

    @IsBoolean()
    @IsOptional() // Cho phép rỗng
    block_topic: boolean;

}