import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateRubricDto {

    @IsNotEmpty()
    rubric_name: string;

    @IsNotEmpty()
    @IsOptional()
    rubric_category: string;

    @IsOptional()
    rubric_topic_category: string;

    @IsOptional()
    rubric_evaluations: string;

    @IsOptional()
    rubric_note: string;

    @IsOptional()
    rubric_template: string;

}
