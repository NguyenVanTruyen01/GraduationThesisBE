import { Module } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { FacultySchema } from "./models/faculty.model";
import { ValidateUtils } from "../../utils/validate.utils";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Faculty", schema: FacultySchema }]),
  ],
  controllers: [FacultyController],
  providers: [FacultyService, ValidateUtils]
})
export class FacultyModule { }
