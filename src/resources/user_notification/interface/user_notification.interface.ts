export interface IUserNotification{
    readonly user_notification_title: string;
    readonly user_notification_sender: string;
    readonly user_notification_recipient: string;
    readonly user_notification_content: string;
    readonly user_notification_type: number;
    readonly user_notification_isRead: boolean;
}