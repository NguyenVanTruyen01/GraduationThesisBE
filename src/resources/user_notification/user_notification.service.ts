import { Body, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserNotificationDto } from './dto/create-user_notification.dto';
import { UpdateUserNotificationDto } from './dto/update-user_notification.dto';
import { InjectModel } from "@nestjs/mongoose";
import { IUserNotification } from "./interface/user_notification.interface";
import { Model } from "mongoose";
import { IUser } from "../users/interface/user.interface";
import { ValidateUtils } from "../../utils/validate.utils";

import { USER_NOTIFICATION_CONSTANTS } from './constant/user_notification.constant'
import { ITopic } from '../topics/interface/topic.interface';
import { UserNotificationFunction } from './user_notification.function';

@Injectable()
export class UserNotificationService {

    constructor(
        @InjectModel("UserNotification") private userNotificationModel: Model<IUserNotification>,
        @InjectModel("User") private userModel: Model<IUser>,
        @InjectModel("Topic") private topicModel: Model<ITopic>,
        private userNotificationFunction: UserNotificationFunction,
        private validateUtils: ValidateUtils) {
    }

    async create(createUserNotificationDto: CreateUserNotificationDto) {

        //create
        const user_notification = await this.userNotificationModel.create(createUserNotificationDto);
        if (!user_notification) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Tạo mới thông báo thất bại!",
                error: USER_NOTIFICATION_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Tạo mới thông báo thành công!",
            error: null,
            data: {
                user_notification
            }
        }
    }

    async sendNotifyForStudentManyTopics(req) {

        const currentUserId = req.currentUser._id;
        const { topic_ids, message } = req.body;

        let userNotification = {
            user_notification_title: "Thông báo: Vui lòng tải lên các tài liệu quan trọng",
            user_notification_sender: currentUserId,
            user_notification_recipient: null,
            user_notification_content: message,
            user_notification_isRead: false,
            user_notification_topic: null
        }

        const promiseBunch = topic_ids.map(async topic_id => {
            const topic: any = await this.topicModel.findById(topic_id);
            if (topic && topic.topic_group_student && topic.topic_group_student.length > 0) {
                userNotification.user_notification_topic = topic_id;
                await this.userNotificationFunction.createNotificationForMemberOfManyGroup(topic.topic_group_student, userNotification)
            }
        })

        const results = await Promise.all(promiseBunch)

        if (!results) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Thông báo thất bại!`,
                error: USER_NOTIFICATION_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Thông báo thành công!",
            error: null,
            data: {}
        }
    }

    async sendNotifyForManyUsers(req) {

        const currentUserId = req.currentUser._id;
        const { user_ids, title, message } = req.body;

        let userNotification = {
            user_notification_title: title ? title : "Thông báo quan trọng!",
            user_notification_sender: currentUserId,
            user_notification_recipient: null,
            user_notification_content: message,
            user_notification_isRead: false,
            user_notification_topic: null
        }

        await this.userNotificationFunction.createNotificationForManyUser(user_ids, userNotification)

        return {
            statusCode: HttpStatus.OK,
            message: "Thông báo thành công!",
            error: null,
            data: {
                success: user_ids.length
            }
        }
    }

    async findAll(req) {
        const currentUserId = req.currentUser._id;

        const user_notifications = await this.userNotificationModel
            .find({
                user_notification_recipient: currentUserId
            })
            .sort({ "createdAt": -1 })
            .lean();

        const total_unread = await this.userNotificationModel.count({
            user_notification_recipient: currentUserId,
            user_notification_isRead: USER_NOTIFICATION_CONSTANTS.STATUS.UNREAD
        })

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách thông báo thành công!",
            error: null,
            data: {
                user_notifications,
                total_unread
            }
        }
    }

    async findOne(req, id: string) {

        this.validateUtils.validateObjectId(id);
        const currentUserId = req.currentUser._id;

        const user_notification: any = await this.userNotificationModel
            .findById(id)
            .lean();

        if (!user_notification || user_notification.user_notification_recipient != currentUserId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Không tìm thấy thông báo!`,
                error: USER_NOTIFICATION_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        // Sửa thành là đã đọc
        await this.userNotificationModel
            .findByIdAndUpdate(id, { user_notification_isRead: true })
            .lean();

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy chi tiết thông báo thành công!",
            error: null,
            data: {
                user_notification
            }
        }
    }

    async update(id: string, updateUserNotificationDto: UpdateUserNotificationDto) {

        this.validateUtils.validateObjectId(id);

        const options = {
            new: true,
        };

        const user_notification = await this.userNotificationModel
            .findByIdAndUpdate(id, updateUserNotificationDto, options)
            .lean();

        if (!user_notification) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "cập nhật thông báo thất bại!",
                error: USER_NOTIFICATION_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật thông báo thành công!",
            error: null,
            data: {
                user_notification
            }
        }
    }

    async remove(req, id: string) {

        this.validateUtils.validateObjectId(id);
        const currentUserId = req.currentUser._id;

        const existedNoty: any = await this.userNotificationModel.findById(id);
        if (!existedNoty) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không tìm thấy thông báo!",
                error: USER_NOTIFICATION_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        if (existedNoty.user_notification_recipient != currentUserId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thực hiện hành động này!",
                error: USER_NOTIFICATION_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)
        }

        const user_notification = await this.userNotificationModel.findByIdAndDelete(id).exec();

        if (!user_notification) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Xóa thông báo thất bại!",
                error: USER_NOTIFICATION_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa thông báo thành công!",
            error: null,
            data: {
                user_notification
            }
        }
    }

    async deleteMany(req) {

        const currentUserId = req.currentUser._id;
        const notification_ids = req.body.notification_ids;

        let filter: any = {
            user_notification_recipient: currentUserId
        }

        if (notification_ids && notification_ids.length > 0) {
            filter._id = { $in: notification_ids }
        }

        await this.userNotificationModel.deleteMany(filter);

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa tất cả đề tài thành công!",
            error: null,
            data: {}
        }
    }

}
