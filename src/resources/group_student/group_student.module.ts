import { Module } from '@nestjs/common';
import { GroupStudentService } from './group_student.service';

import { TeacherGroupStudentController } from './controllers/teacher_group_student.controller';
import { LeaderGroupStudentController } from './controllers/leader_group_student.controller';

import { MongooseModule } from "@nestjs/mongoose";
import { GroupStudentSchema } from "./models/group_student.model";
import { UserSchema } from "../users/models/user.model";
import { ValidateUtils } from "../../utils/validate.utils";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "GroupStudent", schema: GroupStudentSchema }]),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
  ],
  controllers: [
    TeacherGroupStudentController,
    LeaderGroupStudentController
  ],
  providers: [GroupStudentService, ValidateUtils]
})
export class GroupStudentModule { }
