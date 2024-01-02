import { Module } from '@nestjs/common';
import { LevelScoreService } from './level_score.service';
import { LevelScoreController } from './level_score.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { LevelScoreSchema } from "./models/level_score.model";
import { ValidateUtils } from "../../utils/validate.utils";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "LevelScore", schema: LevelScoreSchema }]),
  ],
  controllers: [LevelScoreController],
  providers: [LevelScoreService, ValidateUtils]
})
export class LevelScoreModule { }
