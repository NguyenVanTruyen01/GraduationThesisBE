import { PartialType } from '@nestjs/mapped-types';
import { Teacher_CreateTopicDto } from './teacher_create-topic.dto';

export class Teacher_UpdateTopicDto extends PartialType(Teacher_CreateTopicDto) { }
