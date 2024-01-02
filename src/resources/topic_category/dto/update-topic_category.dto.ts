import { PartialType } from '@nestjs/mapped-types';
import { CreateTopicCategoryDto } from './create-topic_categorydto';

export class UpdateTopicCategoryDto extends PartialType(CreateTopicCategoryDto) { }
