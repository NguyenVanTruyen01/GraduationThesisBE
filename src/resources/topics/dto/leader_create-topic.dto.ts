import { IsArray, IsNotEmpty, IsString, IsOptional, IsNumber } from "class-validator";
import { TOPICS_CONSTANTS } from "../constant/topics.constant";

export class Leader_CreateTopicDto {

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
    topic_leader_status: string = TOPICS_CONSTANTS.LEADER_STATUS.ACTIVE;

    @IsArray()
    @IsOptional() // Cho phép rỗng
    topic_group_student: string[];

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_reviewer: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_assembly: string;

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
    rubric_instructor: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    rubric_reviewer: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    rubric_assembly: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_room: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_time_start: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_time_end: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_date: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    topic_major: string;

    @IsOptional() // Cho phép rỗng
    topic_block: boolean;
}
