import { Module } from '@nestjs/common';
import { RubricEvaluationService } from './rubric_evaluation.service';
import { LeaderRubricEvaluationController } from './controllers/leader_rubric_evaluation.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { RubricEvaluationSchema } from "./models/rubric_evaluation.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { RubricSchema } from "../rubric/models/rubric.model";
import { LevelScoreSchema } from "../level_score/models/level_score.model";
import { TopicSchema } from '../topics/models/topic.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "RubricEvaluation", schema: RubricEvaluationSchema }]),
    MongooseModule.forFeature([{ name: "Rubric", schema: RubricSchema }]),
    MongooseModule.forFeature([{ name: "LevelScore", schema: LevelScoreSchema }]),
    MongooseModule.forFeature([{ name: "Topic", schema: TopicSchema }]),
  ],
  controllers: [LeaderRubricEvaluationController],
  providers: [RubricEvaluationService, ValidateUtils]
})
export class RubricEvaluationModule { }
