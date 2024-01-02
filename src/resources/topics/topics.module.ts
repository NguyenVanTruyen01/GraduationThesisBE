import { Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { LeaderTopicsController } from './controllers/leader_topics.controller';
import { TeacherTopicsController } from './controllers/teacher_topics.controller';
import { StudentTopicsController } from './controllers/student_topics.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { TopicSchema } from "./models/topic.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { GroupStudentSchema } from "../group_student/models/group_student.model";
import { UserNotificationSchema } from "../user_notification/models/user_notification.model";
import { GroupStudentFunction } from "../group_student/group_student.function";
import { UserNotificationFunction } from "../user_notification/user_notification.function";
import { UserSchema } from '../users/models/user.model';
import { AssemblySchema } from '../assembly/models/assembly.model';
import { AssemblyFunction } from '../assembly/assembly.function';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: "Topic", schema: TopicSchema }]),
        MongooseModule.forFeature([{ name: "GroupStudent", schema: GroupStudentSchema }]),
        MongooseModule.forFeature([{ name: "UserNotification", schema: UserNotificationSchema }]),
        MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
        MongooseModule.forFeature([{ name: "Assembly", schema: AssemblySchema }]),
    ],
    controllers: [
        LeaderTopicsController,
        TeacherTopicsController,
        StudentTopicsController
    ],
    providers: [
        TopicsService,
        ValidateUtils,
        GroupStudentFunction,
        UserNotificationFunction,
        AssemblyFunction
    ],
    exports: [GroupStudentFunction, UserNotificationFunction],
})
export class TopicsModule {
}
