import { Module } from '@nestjs/common';
import { MongooseModule } from "@nestjs/mongoose";
import { UserNotificationService } from './user_notification.service';
import { UserNotificationController } from './controllers/user_notification.controller';

import { UserNotificationSchema } from "./models/user_notification.model";
import { UserSchema } from "../users/models/user.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { GroupStudentSchema } from "../group_student/models/group_student.model";
import { TopicSchema } from '../topics/models/topic.model';
import { UserNotificationFunction } from './user_notification.function';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: "UserNotification", schema: UserNotificationSchema }]),
        MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
        MongooseModule.forFeature([{ name: "GroupStudent", schema: GroupStudentSchema }]),
        MongooseModule.forFeature([{ name: "Topic", schema: TopicSchema }]),
    ],
    controllers: [
        UserNotificationController
    ],
    providers: [
        UserNotificationService,
        ValidateUtils,
        UserNotificationFunction
    ]
})
export class UserNotificationModule {
}
