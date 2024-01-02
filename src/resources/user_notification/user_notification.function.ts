import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IUserNotification } from "./interface/user_notification.interface";
import { Model } from "mongoose";
import { USER_NOTIFICATION_CONSTANTS } from "./constant/user_notification.constant";
import { IGroupStudent } from "../group_student/interface/group_student.interface";

@Injectable()
export class UserNotificationFunction {
    constructor(
        @InjectModel('UserNotification') private userNotificationModel: Model<IUserNotification>,
        @InjectModel('GroupStudent') private groupStudentModel: Model<IGroupStudent>
    ) {
    }

    async createNotificationForUser(userNotification) {
        try {
            //Tạo mới thông báo cho người dùng
            const user_notification = await this.userNotificationModel.create(userNotification);
            if (!user_notification) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Tạo mới thông báo thất bại!",
                    error: USER_NOTIFICATION_CONSTANTS.ERROR.CREATED_FAIL
                }, HttpStatus.BAD_REQUEST)
            }
        } catch (error) {
            console.error('Lỗi khi kiểm tra sinh viên trong nhóm:', error);
            throw error;
        }
    }

    async createNotificationForManyUser(user_ids: string[], userNotification) {
        try {

            const promiseBunch = user_ids.map(user => {
                userNotification.user_notification_recipient = user;
                //Tạo mới thông báo cho người dùng
                this.createNotificationForUser(userNotification)
            })

            await Promise.all(promiseBunch)

        } catch (error) {
            console.error('Lỗi khi kiểm tra sinh viên trong nhóm:', error);
            throw error;
        }
    }

    async createNotificationForMemberOfOneGroup(group_id, userNotification) {
        try {

            const groupStudent: any = await this.groupStudentModel.findById(group_id);

            await this.createNotificationForManyUser(groupStudent.group_member, userNotification)

        } catch (error) {
            console.error('Lỗi gửi thông báo cho các thành viên trong nhóm:', error);
            throw error;
        }
    }

    async createNotificationForMemberOfManyGroup(group_ids: string[], userNotification) {
        try {
            const promiseBunch = group_ids.map(group => {
                this.createNotificationForMemberOfOneGroup(group, userNotification)
            })
            await Promise.all(promiseBunch)

        } catch (error) {
            console.error('Lỗi gửi thông báo cho các thành viên trong nhóm:', error);
            throw error;
        }
    }

    
}
