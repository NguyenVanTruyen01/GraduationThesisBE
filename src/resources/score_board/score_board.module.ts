import { Module } from '@nestjs/common';
import { ScoreBoardService } from './score_board.service';
import { ScoreBoardController } from './controllers/score_board.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { ScoreBoardSchema } from "./models/score_board.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { RubricSchema } from "../rubric/models/rubric.model";
import { TopicSchema } from "../topics/models/topic.model";
import { UserSchema } from "../users/models/user.model";
import { RubricEvaluationSchema } from "../rubric_evaluation/models/rubric_evaluation.model";
import { ScoreBoardFunction } from "./score_board.function";
import { GroupStudentFunction } from "../group_student/group_student.function";
import { GroupStudentSchema } from "../group_student/models/group_student.model";
import { AssemblySchema } from '../assembly/models/assembly.model';
import { AssemblyFunction } from '../assembly/assembly.function';
import { StudentScoreBoardController } from './controllers/student_score_board.controller';
import { RegistrationPeriodSchema } from '../registration_period/models/registration_period.model';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: "ScoreBoard", schema: ScoreBoardSchema }]),
    MongooseModule.forFeature([{ name: "Rubric", schema: RubricSchema }]),
    MongooseModule.forFeature([{ name: "Topic", schema: TopicSchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: "RubricEvaluation", schema: RubricEvaluationSchema }]),
    MongooseModule.forFeature([{ name: "GroupStudent", schema: GroupStudentSchema }]),
    MongooseModule.forFeature([{ name: "Assembly", schema: AssemblySchema }]),
    MongooseModule.forFeature([{ name: "RegistrationPeriod", schema: RegistrationPeriodSchema }]),
  ],
  controllers: [
    ScoreBoardController,
    StudentScoreBoardController
  ],
  providers: [
    ScoreBoardService,
    ValidateUtils,
    ScoreBoardFunction,
    GroupStudentFunction,
    AssemblyFunction
  ]
})
export class ScoreBoardModule { } 
