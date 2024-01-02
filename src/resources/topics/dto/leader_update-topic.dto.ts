import { PartialType } from '@nestjs/mapped-types';
import { Leader_CreateTopicDto } from './leader_create-topic.dto';

export class Leader_UpdateTopicDto extends PartialType(Leader_CreateTopicDto) {}
