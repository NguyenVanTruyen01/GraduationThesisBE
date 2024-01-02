import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema({ timestamps: true})
export class LevelScore {

    @Prop({
        required: true,
        unique:true
    })
    level_id: number;

    @Prop({
        required: true
    })
    level_title: string;

    //than điểm
    @Prop({
        required: true
    })
    level_value: number;


}
export const LevelScoreSchema = SchemaFactory.createForClass(LevelScore);
