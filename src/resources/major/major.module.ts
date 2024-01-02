import { Module } from '@nestjs/common';
import { MajorService } from './major.service';
import { MajorController } from './major.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { MajorSchema } from "./models/major.model";
import { FacultySchema } from "../faculty/models/faculty.model";
import { ValidateUtils } from "../../utils/validate.utils";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Major", schema: MajorSchema }]),
    MongooseModule.forFeature([{ name: "Faculty", schema: FacultySchema }]),
  ],
  controllers: [MajorController],
  providers: [MajorService, ValidateUtils]
})
export class MajorModule { }
