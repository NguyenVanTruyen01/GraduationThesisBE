import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose"
import * as mongoose from 'mongoose';
import {USER_NOTIFICATION_CONSTANTS} from '../constant/user_notification.constant'

@Schema({timestamps: true})
export class UserNotification {

    @Prop()
    user_notification_title: string;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    })
    user_notification_sender: string;// Người gửi thông báo

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    })
    user_notification_recipient: string;// Người nhận thông báo

    @Prop({
        default: ""
    })
    user_notification_content: string;// Nội dung thông báo

    @Prop({
        default: null
    })
    user_notification_type: number;// Loại thông báo

    @Prop({
        default: USER_NOTIFICATION_CONSTANTS.STATUS.UNREAD
    })
    user_notification_isRead: boolean;// Trạng thái đã đọc của thông báo

    @Prop({
        default: null
    })
    user_notification_topic: string;

}

export const UserNotificationSchema = SchemaFactory.createForClass(UserNotification);
