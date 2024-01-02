import { Module } from '@nestjs/common';
import { RubricService } from './rubric.service';
import { LeaderRubricController } from './controllers/leader_rubric.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { RubricSchema } from "./models/rubric.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { RubricEvaluationSchema } from "../rubric_evaluation/models/rubric_evaluation.model";
import { TopicCategorySchema } from "../topic_category/models/topic_category.model";
import { TopicSchema } from '../topics/models/topic.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Rubric", schema: RubricSchema }]),
    MongooseModule.forFeature([{ name: "TopicCategory", schema: TopicCategorySchema }]),
    MongooseModule.forFeature([{ name: "RubricEvaluation", schema: RubricEvaluationSchema }]),
    MongooseModule.forFeature([{ name: "Topic", schema: TopicSchema }]),
  ],
  controllers: [LeaderRubricController],
  providers: [RubricService, ValidateUtils]
})
export class RubricModule { }
