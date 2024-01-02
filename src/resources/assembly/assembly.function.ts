import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IAssembly } from "./interface/assembly.interface";
import { Model, Types } from "mongoose";
import { ValidateUtils } from 'src/utils/validate.utils';

@Injectable()
export class AssemblyFunction {
    constructor(
        @InjectModel('Assembly') private assemblyModel: Model<IAssembly>,
        private validateUtils: ValidateUtils,
    ) { }

    // Kiểm tra xem giảng viên có trong hội đồng không
    async isTeacherInGroup(teacher_id: string, assembly_id: string) {
        try {
            const result = await this.assemblyModel.exists({
                _id: assembly_id,
                $or: [
                    { chairman: teacher_id },
                    { secretary: teacher_id },
                    { members: { $in: [teacher_id] } },
                ],
            });
            return result;

        } catch (error) {
            console.error('Lỗi khi kiểm tra giảng viên trong hội đồng:', error);
            throw error;
        }
    }

    // Lấy danh sách id hội đồng giảng viên được phân
    async listAssemblyOfTeacher(teacher_id: string) {
        try {
            let result = [];
            result = await this.assemblyModel.find({
                $or: [
                    { chairman: teacher_id },
                    { secretary: teacher_id },
                    { members: { $in: [teacher_id] } },
                ],
            });

            await this.transformAssembly(result)
                .then((output: any) => {
                    result = output;
                })

            return result;

        } catch (error) {
            console.error('Lỗi khi kiểm tra giảng viên trong hội đồng:', error);
            throw error;
        }
    }

    async transformAssembly(topics: any): Promise<any> {
        return await Promise.all(
            topics.map(async (topic: any) => topic._id)
        )
    }

    async getRoleOfTeacherInAssembly(group: any, teacher_id: string) {

        console.log(group);

        // Kiểm tra trường chairman và secretary
        if (group.chairman == teacher_id) {
            return 'Chủ tịch'
        }

        if (group.secretary == teacher_id) {
            return 'Thư ký'
        }

        // Kiểm tra trường members
        if (group.members.map(String).includes(teacher_id)) {
            return 'Ủy viên'
        }

        return null;
    }

}
