import { IsDateString, IsEmpty, IsNotEmpty, IsOptional } from "class-validator";

export class CreateAssemblyDto {

    @IsOptional() // Cho phép rỗng
    assembly_name: string;

    @IsOptional() // Cho phép rỗng
    assembly_major: string; // Chuyên môn của hội đồng

    @IsNotEmpty()
    chairman: string;

    @IsNotEmpty()
    secretary: string;

    @IsOptional() // Cho phép rỗng
    members: string[];
}
