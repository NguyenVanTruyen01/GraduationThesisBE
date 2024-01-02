import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupStudentDto } from './create-group_student.dto';

export class UpdateGroupStudentDto extends PartialType(CreateGroupStudentDto) {}
