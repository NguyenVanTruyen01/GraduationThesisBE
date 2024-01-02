import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class TopicCategory {
    @Prop({
        required: true
    })
    topic_category_title: string;

    @Prop({
        default: ''
    })
    topic_category_description: string;

}
export const TopicCategorySchema = SchemaFactory.createForClass(TopicCategory);
