import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IGroupStudent } from "./interface/group_student.interface";
import { Model } from "mongoose";

@Injectable()
export class GroupStudentFunction {
    constructor(
        @InjectModel('GroupStudent') private groupStudentModel: Model<IGroupStudent>,
    ) { }

    async isAnyStudentInGroup(group_student_ids) {
        try {

            const result = await this.groupStudentModel.exists({
                group_member: { $in: group_student_ids },
            });
            const groupStudent = await this.groupStudentModel.findById(result)
            const data = group_student_ids?.length > 0 ? group_student_ids.filter((item: string) => groupStudent?.group_member.find((itemnew) => item == itemnew)) : []
            return data;
        } catch (error) {
            console.error('Lỗi khi kiểm tra sinh viên trong nhóm:', error);
            throw error;
        }
    }

    // Kiểm tra xem sinh viên có trong group không
    async isStudentInGroup(student_id: string, group_id: string) {
        try {
            const result = await this.groupStudentModel.exists({
                _id: group_id,
                group_member: { $in: student_id },
            });

            return result;

        } catch (error) {
            console.error('Lỗi khi kiểm tra sinh viên trong nhóm:', error);
            throw error;
        }
    }

    async checkGroupStudentDuplicateIds(group_student_ids) {
        let result = new Set(group_student_ids).size === group_student_ids.length;
        // Có result thì "Không có id nào bị lặp."
        // Ngược lại có id bị lăp
        return result;
    }


}
