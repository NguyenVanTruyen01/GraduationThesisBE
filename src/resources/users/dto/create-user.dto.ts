import { IsNotEmpty, IsEmail, IsString, IsDateString, MaxLength, MinLength, IsOptional, IsNumber } from "class-validator";


export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsString()
    @IsNotEmpty()
    role: string;

    @IsString()
    @IsNotEmpty()
    user_id: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_avatar: string;

    @IsString()
    @IsNotEmpty()
    user_name: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_date_of_birth: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
    user_phone: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_permanent_address: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_temporary_address: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_department: string;

    @IsString()
    @IsNotEmpty()
    user_faculty: string;

    @IsString()
    @IsNotEmpty()
    user_major: string;

    @IsOptional() // Cho phép rỗng
    user_status: boolean = true;

    @IsOptional() // Cho phép rỗng
    @IsNumber()
    user_average_grade: number;

    @IsOptional() // Cho phép rỗng
    @IsString()
    user_CCCD: string;
}
