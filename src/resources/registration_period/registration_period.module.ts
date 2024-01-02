import { Module } from '@nestjs/common';
import { RegistrationPeriodService } from './registration_period.service';
import { LeaderRegistrationPeriodController } from './controllers/leader_registration_period.controller';
import { TeacherRegistrationPeriodController } from './controllers/teacher_registration_period.controller';
import { StudentRegistrationPeriodController } from './controllers/student_registration_period.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { RegistrationPeriodSchema } from "./models/registration_period.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { RegistrantionPeriodCronJob } from "./cronjob/registration_period.cronjob"
import { TopicSchema } from '../topics/models/topic.model';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: "RegistrationPeriod", schema: RegistrationPeriodSchema }]),
        MongooseModule.forFeature([{ name: "Topic", schema: TopicSchema }]),
    ],
    controllers: [
        LeaderRegistrationPeriodController,
        TeacherRegistrationPeriodController,
        StudentRegistrationPeriodController],
    providers: [RegistrationPeriodService, RegistrantionPeriodCronJob, ValidateUtils]
})
export class RegistrationPeriodModule { }
