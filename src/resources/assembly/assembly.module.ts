import { Module } from '@nestjs/common';
import { AssemblyService } from './assembly.service';
import { AssemblyController } from './controllers/assembly.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { AssemblySchema } from "./models/assembly.model";
import { ValidateUtils } from "../../utils/validate.utils";
import { AssemblyFunction } from "./assembly.function"
import { LeaderAssemblyController } from './controllers/leader_assembly.controller';
import { TeacherAssemblyController } from './controllers/teacher_assembly.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Assembly", schema: AssemblySchema }]),
  ],
  controllers: [
    AssemblyController,
    LeaderAssemblyController,
    TeacherAssemblyController
  ],
  providers: [
    AssemblyService,
    ValidateUtils,
    AssemblyFunction
  ]
})
export class AssemblyModule { }
