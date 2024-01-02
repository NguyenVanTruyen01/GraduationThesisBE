import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemSettingDto } from './create-system_setting.dto';

export class UpdateSystemSettingDto extends PartialType(CreateSystemSettingDto) { }
