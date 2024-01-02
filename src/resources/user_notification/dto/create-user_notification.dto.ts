import {IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateUserNotificationDto {

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_notification_title: string;

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_notification_sender: string;

    @IsString()
    @IsNotEmpty()
    user_notification_recipient: string;

    @IsString()
    @IsNotEmpty()
    user_notification_content: string;

    @IsNumber()
    @IsOptional() // Cho phép rỗng
    user_notification_type: string;

    @IsOptional() // Cho phép rỗng
    user_notification_isRead: boolean;

    @IsString()
    @IsOptional() // Cho phép rỗng
    user_notification_topic: string;

}
