import { Module } from '@nestjs/common';
import { SystemSettingService } from './system_setting.service';
import { SystemSettingController } from './controllers/system_setting.controller';
import { MongooseModule } from "@nestjs/mongoose";
import { SystemSettingSchema } from "./models/system_setting.model";
import { ValidateUtils } from "../../utils/validate.utils";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: "SystemSetting", schema: SystemSettingSchema }]),
    ],
    controllers: [
        SystemSettingController,
    ],
    providers: [SystemSettingService, ValidateUtils]
})
export class SystemSettingModule { }
