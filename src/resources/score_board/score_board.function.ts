import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IScoreBoard } from "./interface/score_board.interface";
import { IRubric } from "../rubric/interface/rubric.interface";
import { ITopic } from "../topics/interface/topic.interface";
import { Model } from "mongoose";
import { GroupStudentFunction } from "../group_student/group_student.function";
import { AssemblyFunction } from '../assembly/assembly.function';

interface RubricEvaluation {
    evaluation_id: string;
    evaluation_score: number | null;
}

interface Rubric {
    _id: string;
    rubric_evaluations: string[];
}

interface TransformedRubric {
    rubric_student_evaluations: RubricEvaluation[];
}

@Injectable()
export class ScoreBoardFunction {
    constructor(
        @InjectModel('ScoreBoard') private scoreBoardModel: Model<IScoreBoard>,
        @InjectModel('Rubric') private rubricModel: Model<IRubric>,
        @InjectModel('Topic') private topicModel: Model<ITopic>,
        private groupStudentFunction: GroupStudentFunction,
        private assemblyFunction: AssemblyFunction,
    ) { }

    async createScoreBoardInstructor(topic_id: any, student_id: any) {

        let defaultData = {
            rubric_id: null,
            rubric_category: 1,
            topic_id: topic_id,
            grader: null,
            student_id: student_id,
            rubric_student_evaluations: []
        }

        const topic: any = await this.topicModel.findById(topic_id);
        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài không tồn tại!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        const validStudent = await this.groupStudentFunction.isStudentInGroup(student_id, topic.topic_group_student);
        if (!validStudent) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không có quyền thực hiện hành động này!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        if (!topic.rubric_instructor || topic.rubric_instructors == '') {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài chưa được gán mẫu chấm điểm! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        } else {
            defaultData.rubric_id = topic.rubric_instructor
        }

        if (!topic.topic_instructor || topic.topic_instructor == '') {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài chưa đủ điều kiện để chấm điểm! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        } else {
            defaultData.grader = topic.topic_instructor
        }

        let rubric: any = await this.rubricModel.findById(topic.rubric_instructor)
        if (!rubric) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Mẫu chấm điểm không hợp lệ! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        await this.transformRubric(rubric)
            .then((outputRubric: TransformedRubric) => {
                defaultData.rubric_student_evaluations = outputRubric.rubric_student_evaluations;
            })
            .catch((error) => {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Mẫu chấm điểm không hợp lệ! ",
                    error: "NOT FOUND"
                }, HttpStatus.BAD_REQUEST)
            });

        // Tạo bảng điểm cho sing viên
        const scoreboard: any = await this.scoreBoardModel.create(defaultData);
        if (!scoreboard) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Lấy bảng điểm thất bại!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }


        return scoreboard;
    }

    async createScoreBoardReviewer(topic_id: any, student_id: any) {

        let defaultData = {
            rubric_id: null,
            rubric_category: 2,
            topic_id: topic_id,
            grader: null,
            student_id: student_id,
            rubric_student_evaluations: []
        }

        const topic: any = await this.topicModel.findById(topic_id);
        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài không tồn tại!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        const validStudent = await this.groupStudentFunction.isStudentInGroup(student_id, topic.topic_group_student);
        if (!validStudent) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không có quyền thực hiện hành động này!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        if (!topic.rubric_reviewer || topic.rubric_reviewer == '') {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài chưa được gán mẫu chấm điểm! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        } else {
            defaultData.rubric_id = topic.rubric_reviewer
        }

        if (!topic.topic_reviewer || topic.topic_reviewer == '') {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài chưa đủ điều kiện để chấm điểm! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        } else {
            defaultData.grader = topic.topic_reviewer
        }

        let rubric: any = await this.rubricModel.findById(topic.rubric_reviewer)
        if (!rubric) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Mẫu chấm điểm không hợp lệ! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        await this.transformRubric(rubric)
            .then((outputRubric: TransformedRubric) => {
                defaultData.rubric_student_evaluations = outputRubric.rubric_student_evaluations;
            })
            .catch((error) => {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Mẫu chấm điểm không hợp lệ! ",
                    error: "NOT FOUND"
                }, HttpStatus.BAD_REQUEST)
            });

        // Tạo bảng điểm cho sing viên
        const scoreboard: any = await this.scoreBoardModel.create(defaultData);
        if (!scoreboard) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Lấy bảng điểm thất bại!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        return scoreboard;
    }

    async createScoreBoardAssembly(topic_id: any, student_id: any, grader_id: any) {

        let defaultData = {
            rubric_id: null,
            rubric_category: 3,
            topic_id: topic_id,
            grader: null,
            student_id: student_id,
            rubric_student_evaluations: []
        }

        const topic: any = await this.topicModel.findById(topic_id);
        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài không tồn tại!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        const validStudent = await this.groupStudentFunction.isStudentInGroup(student_id, topic.topic_group_student);
        if (!validStudent) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không có quyền thực hiện hành động này!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        if (!topic.rubric_assembly || topic.rubric_assembly == '') {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài chưa được gán mẫu chấm điểm! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        defaultData.rubric_id = topic.rubric_assembly

        if (!topic.topic_assembly || topic.topic_assembly == '') {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đề tài chưa đủ điều kiện để chấm điểm! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        // Kiểm tra giảng viên có nằm trong hội đồng chấm điểm của đề tài không
        const validTeacher = await this.assemblyFunction.isTeacherInGroup(grader_id, topic.topic_assembly)
        if (!validTeacher) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không tìm thấy bảng điểm! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        defaultData.grader = grader_id

        let rubric: any = await this.rubricModel.findById(topic.rubric_assembly)
        if (!rubric) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Mẫu chấm điểm không hợp lệ! ",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        await this.transformRubric(rubric)
            .then((outputRubric: TransformedRubric) => {
                defaultData.rubric_student_evaluations = outputRubric.rubric_student_evaluations;
            })
            .catch((error) => {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Mẫu chấm điểm không hợp lệ! ",
                    error: "NOT FOUND"
                }, HttpStatus.BAD_REQUEST)
            });

        // Tạo bảng điểm cho sinh viên
        const scoreboard: any = await this.scoreBoardModel.create(defaultData);
        if (!scoreboard) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Lấy bảng điểm thất bại!",
                error: "NOT FOUND"
            }, HttpStatus.BAD_REQUEST)
        }

        return scoreboard;
    }

    async transformRubric(rubric: Rubric): Promise<TransformedRubric> {
        return {
            rubric_student_evaluations: await Promise.all(
                rubric.rubric_evaluations.map(async (evaluation_id) => ({
                    evaluation_id,
                    evaluation_score: null,
                }))
            ),
        };
    }

}
