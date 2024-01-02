import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class GroupStudent {

    @Prop()
    group_name: string

    @Prop({
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    })
    group_member: string[];

    @Prop({
        default: 3
    })
    group_max_member: number; // Số thành viên tối đa của 1 nhóm thực hiện khóa luận

}
export const GroupStudentSchema = SchemaFactory.createForClass(GroupStudent);
