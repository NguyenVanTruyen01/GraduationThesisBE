import {PartialType} from "@nestjs/mapped-types";
import {Student_CreateTopicDto} from "./student_create-topic.dto";


export class Student_UpdateTopicDto extends PartialType(Student_CreateTopicDto) {}
