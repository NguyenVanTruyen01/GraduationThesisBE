import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateTopicCategoryDto {

    @IsString()
    @IsNotEmpty()
    topic_category_title: string;

    @IsOptional() // Cho phép rỗng
    topic_category_description: string;
}
