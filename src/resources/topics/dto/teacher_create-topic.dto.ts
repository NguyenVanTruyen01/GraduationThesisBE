import { IsArray, IsNotEmpty, IsString, IsIn, IsOptional, IsNumber } from "class-validator";
import { TOPICS_CONSTANTS } from "../constant/topics.constant";

export class Teacher_CreateTopicDto {

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
    @IsOptional() // Cho phép rỗng
    topic_instructor: string;

    @IsString()
    topic_teacher_status: string = TOPICS_CONSTANTS.TEACHER_STATUS.READY;

    @IsArray()
    @IsOptional() // Cho phép rỗng
    topic_group_student: string[];

    @IsString()
    @IsOptional() // Cho phép rỗng
    @IsIn([TOPICS_CONSTANTS.LEADER_STATUS.PENDING])
    topic_leader_status: string;

    @IsNumber()
    @IsOptional() // Cho phép rỗng
    topic_max_members: number;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_category: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_coInstructor: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_final_report: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_major: string;
}
