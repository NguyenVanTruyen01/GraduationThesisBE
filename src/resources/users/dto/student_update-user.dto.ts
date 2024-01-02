import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class StudentUpdateUserDto extends PartialType(OmitType(
    CreateUserDto,
    ['role', 'user_avatar', 'user_status', 'password']
)) { }
