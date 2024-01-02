import { Module } from '@nestjs/common';
import { SemesterService } from './semester.service';
import { LeaderSemesterController } from './controllers/leader_semester.controller';
import { TeacherSemesterController } from './controllers/teacher_semester.controller';
import { StudentSemesterController } from './controllers/student_semester.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { SemesterSchema } from "./models/semester.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { RegistrationPeriodSchema } from '../registration_period/models/registration_period.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Semester", schema: SemesterSchema }]),
    MongooseModule.forFeature([{ name: "RegistrationPeriod", schema: RegistrationPeriodSchema }]),
  ],
  controllers: [LeaderSemesterController, TeacherSemesterController, StudentSemesterController],
  providers: [SemesterService, ValidateUtils]
})
export class SemesterModule { }
