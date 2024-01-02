import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class RubricTotalEvaluationDto {
    @IsString()
    @IsOptional()
    total_evaluation_id: string;

    @IsNumber()
    @IsOptional()
    total_evaluation_score: number;
}

export class RubricEvaluationDto {
    @IsString()
    @IsOptional()
    evaluation_id: string;

    @IsNumber()
    @IsOptional()
    evaluation_score: number;
}


export class StudentGradeDto {
    @IsString()
    @IsOptional()
    user_id: string;

    @IsNumber()
    @IsOptional()
    student_score: number;
}


export class CreateScoreBoardDto {

    @IsString()
    @IsNotEmpty()
    rubric_id: string;

    @IsNumber()
    @IsNotEmpty()
    rubric_category: number;

    @IsString()
    @IsNotEmpty()
    topic_id: string;

    @IsString()
    @IsNotEmpty()
    grader: string;

    @IsString()
    @IsOptional()
    student_id: string;

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => StudentGradeDto)
    student_grades?: StudentGradeDto[];

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => RubricTotalEvaluationDto)
    rubric_total_evaluations?: RubricTotalEvaluationDto[];

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => RubricEvaluationDto)
    rubric_student_evaluations: RubricEvaluationDto[];

    @IsOptional()
    total_score: number;
}
