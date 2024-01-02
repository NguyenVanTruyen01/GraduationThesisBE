import { Module } from '@nestjs/common';
import { TopicCategoryService } from './topic_category.service';
import { TopicCategoryController } from './topic_category.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { TopicCategorySchema } from "./models/topic_category.model";
import { ValidateUtils } from "../../utils/validate.utils";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "TopicCategory", schema: TopicCategorySchema }]),
  ],
  controllers: [TopicCategoryController],
  providers: [TopicCategoryService, ValidateUtils]
})
export class TopicCategoryModule { }
