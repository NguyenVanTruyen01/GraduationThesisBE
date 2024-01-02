import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, } from "class-validator";
import { TOPICS_CONSTANTS } from "../constant/topics.constant";

export class Student_CreateTopicDto {

    @IsString()
    @IsNotEmpty()
    topic_registration_period: string;

    @IsString()
    @IsNotEmpty()
    topic_title: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_description: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_creator: string;

    @IsString()
    @IsNotEmpty()
    topic_instructor: string;

    @IsString()
    @IsIn([TOPICS_CONSTANTS.TEACHER_STATUS.PENDING])
    topic_teacher_status: string = TOPICS_CONSTANTS.TEACHER_STATUS.PENDING;

    @IsArray()
    @IsNotEmpty()
    topic_group_student: string[];

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_category: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_final_report: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_major: string;

}
