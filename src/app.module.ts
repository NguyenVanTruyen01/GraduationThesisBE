import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ServeStaticModule } from '@nestjs/serve-static'
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';

import { UsersModule } from './resources/users/users.module';
import { TopicsModule } from './resources/topics/topics.module';
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { FacultyModule } from './resources/faculty/faculty.module';
import { MajorModule } from './resources/major/major.module';
import { GroupStudentModule } from './resources/group_student/group_student.module';
import { SemesterModule } from './resources/semester/semester.module';
import { ScoreBoardModule } from './resources/score_board/score_board.module';
import { LevelScoreModule } from './resources/level_score/level_score.module';
import { RubricModule } from './resources/rubric/rubric.module';
import { AssemblyModule } from './resources/assembly/assembly.module';
import { RegistrationPeriodModule } from './resources/registration_period/registration_period.module';
import { UserNotificationModule } from './resources/user_notification/user_notification.module';
import { TopicCategoryModule } from './resources/topic_category/topic_category.module';
import { RubricEvaluationModule } from './resources/rubric_evaluation/rubric_evaluation.module';

import { AuthMiddleware } from "./middlewares/auth.middleware";
import { AuthLeaderMiddleware } from "./middlewares/authLeader.middleware";
import { AuthTeacherMiddleware } from "./middlewares/authTeacher.middleware";
import { AuthStudentMiddleware } from "./middlewares/authStudent.middleware";

import { LeaderTopicsController } from "./resources/topics/controllers/leader_topics.controller"
import { LeaderSemesterController } from "./resources/semester/controllers/leader_semester.controller"
import { LeaderRegistrationPeriodController } from "./resources/registration_period/controllers/leader_registration_period.controller"

import { TeacherTopicsController } from "./resources/topics/controllers/teacher_topics.controller"
import { TeacherSemesterController } from "./resources/semester/controllers/teacher_semester.controller"
import { TeacherRegistrationPeriodController } from "./resources/registration_period/controllers/teacher_registration_period.controller"

import { StudentTopicsController } from "./resources/topics/controllers/student_topics.controller"
import { StudentSemesterController } from "./resources/semester/controllers/student_semester.controller"
import { StudentRegistrationPeriodController } from "./resources/registration_period/controllers/student_registration_period.controller"

import { UserNotificationController } from "./resources/user_notification/controllers/user_notification.controller"

import { LeaderUsersController } from "./resources/users/controllers/leader_users.controller"
import { TeacherUsersController } from "./resources/users/controllers/teacher_users.controller"
import { StudentUsersController } from "./resources/users/controllers/student_users.controller"
import { AssemblyController } from './resources/assembly/controllers/assembly.controller';
import { ScoreBoardController } from './resources/score_board/controllers/score_board.controller';
import { TeacherAssemblyController } from './resources/assembly/controllers/teacher_assembly.controller';
import { LeaderAssemblyController } from './resources/assembly/controllers/leader_assembly.controller';
import { SystemSettingModule } from './resources/system_setting/system_setting.module';


@Module({
    imports: [
        ScheduleModule.forRoot(),
        ConfigModule.forRoot(),
        MongooseModule.forRoot(process.env.MONGO_URI),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '../uploads'),
        }),
        UsersModule,
        TopicsModule,
        FacultyModule,
        MajorModule,
        GroupStudentModule,
        SemesterModule,
        ScoreBoardModule,
        LevelScoreModule,
        RubricModule,
        AssemblyModule,
        RegistrationPeriodModule,
        UserNotificationModule,
        TopicCategoryModule,
        RubricEvaluationModule,
        SystemSettingModule
    ],
    controllers: [AppController],
    providers: [AppService],

})
export class AppModule {

    configure(consumer: MiddlewareConsumer) {

        //PUBLIC
        consumer
            .apply(AuthMiddleware)
            .forRoutes(
                UserNotificationController,
                AssemblyController,
                ScoreBoardController
            );

        //LEADER
        consumer
            .apply(AuthMiddleware, AuthLeaderMiddleware)
            .forRoutes(
                LeaderTopicsController,
                LeaderSemesterController,
                LeaderRegistrationPeriodController,
                LeaderUsersController,
                LeaderAssemblyController
            );

        //TEACHER
        consumer
            .apply(AuthMiddleware, AuthTeacherMiddleware)
            .forRoutes(
                TeacherTopicsController,
                TeacherSemesterController,
                TeacherRegistrationPeriodController,
                TeacherUsersController,
                TeacherAssemblyController
            );

        //STUDENT
        consumer
            .apply(AuthMiddleware, AuthStudentMiddleware)
            .forRoutes(
                StudentTopicsController,
                StudentSemesterController,
                StudentRegistrationPeriodController,
                StudentUsersController
            );
    }
}
