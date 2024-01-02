import {IsNumber, IsString} from "class-validator";


export class CreateLevelScoreDto {
    @IsNumber()
    level_id: number;

    @IsString()
    level_title: string;

    @IsNumber()
    level_value: number;
}
