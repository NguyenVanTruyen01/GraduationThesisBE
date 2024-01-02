import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthUsersController } from './controllers/auth_users.controller';
import { LeaderUsersController } from './controllers/leader_users.controller';
import { TeacherUsersController } from './controllers/teacher_users.controller';
import { StudentUsersController } from './controllers/student_users.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "./models/user.model"
import { AuthUtils } from "../../utils/auth.utils";
import { ValidateUtils } from "../../utils/validate.utils";
import { TopicSchema } from '../topics/models/topic.model';
import { AssemblyFunction } from '../assembly/assembly.function';
import { AssemblySchema } from '../assembly/models/assembly.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
        MongooseModule.forFeature([{ name: "Topic", schema: TopicSchema }]),
        MongooseModule.forFeature([{ name: "Assembly", schema: AssemblySchema }]),
    ],
    controllers: [
        AuthUsersController,
        LeaderUsersController,
        TeacherUsersController,
        StudentUsersController
    ],
    providers: [
        UsersService,
        AuthUtils,
        ValidateUtils,
        AssemblyFunction
    ],
    exports: [ValidateUtils]
})
export class UsersModule {
}
