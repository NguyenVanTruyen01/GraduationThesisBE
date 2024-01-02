import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import mongoose from "mongoose";

@Schema({ timestamps: true })
export class Assembly {

    @Prop({
        default: "HĐ",
    })
    assembly_name: string; // Tên hội đồng

    @Prop({
        default: null,
    })
    assembly_major: string; // Chuyên môn của hội đồng

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    })
    chairman: string; // Chủ tịch

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    })
    secretary: string; // Thư ký

    @Prop({
        type: [mongoose.Schema.Types.ObjectId],
        ref: "User",
        default: []
    })
    members: string[]; // Ủy viên
}
export const AssemblySchema = SchemaFactory.createForClass(Assembly);
