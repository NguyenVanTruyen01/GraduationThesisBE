import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrationPeriodDto } from './create-registration_period.dto';

export class UpdateRegistrationPeriodDto extends PartialType(CreateRegistrationPeriodDto) {}
