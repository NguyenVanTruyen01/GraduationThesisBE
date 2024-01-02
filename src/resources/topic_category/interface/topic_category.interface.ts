import { Document } from 'mongoose';

export interface ITopicCategory extends Document {
    readonly topic_category_title: string;
    readonly topic_category_description: string;
}