import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateRubricEvaluationDto {

    @IsNotEmpty()
    @IsOptional()
    rubric_id: string;

    @IsNotEmpty()
    serial: number;

    @IsNotEmpty()
    evaluation_criteria: string;

    @IsOptional()
    grading_scale: number;

    @IsOptional()
    weight: number;

    @IsOptional()
    level_core: string;

    @IsOptional()
    note: string;

}
