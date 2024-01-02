import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { ValidateUtils } from "../../utils/validate.utils";
import { GroupStudentFunction } from "../group_student/group_student.function";
import { UserNotificationFunction } from "../user_notification/user_notification.function";

import { Leader_CreateTopicDto } from './dto/leader_create-topic.dto';
import { Student_CreateTopicDto } from './dto/student_create-topic.dto';
import { Teacher_CreateTopicDto } from './dto/teacher_create-topic.dto';
import { Leader_UpdateTopicDto } from './dto/leader_update-topic.dto';
import { Teacher_UpdateTopicDto } from './dto/teacher_update-topic.dto';
import { Student_UpdateTopicDto } from './dto/student_update-topic.dto';

import { ITopic } from "./interface/topic.interface";
import { IGroupStudent } from "../group_student/interface/group_student.interface";
import { IUser } from "../users/interface/user.interface";

import { TOPICS_CONSTANTS } from "./constant/topics.constant";
import { UserSchema } from '../users/models/user.model';
import { AssemblyFunction } from '../assembly/assembly.function';

@Injectable()
export class TopicsService {

    constructor(
        @InjectModel("Topic") private topicModel: Model<ITopic>,
        @InjectModel("GroupStudent") private groupStudentModel: Model<IGroupStudent>,
        @InjectModel("User") private userModel: Model<IUser>,
        private validateUtils: ValidateUtils,
        private groupStudentFunction: GroupStudentFunction,
        private userNotificationFunction: UserNotificationFunction,
        private assemblyFunction: AssemblyFunction,
    ) {
    }

    // =================== LEADER =====================================

    async leaderCreate(req, createTopicDto: Leader_CreateTopicDto) {

        const currentUserId = req.currentUser._id
        createTopicDto.topic_creator = currentUserId

        // Lấy chuyên ngành của giảng viên 
        const teacher = await this.userModel.findById(createTopicDto.topic_instructor);
        if (!teacher) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Dữ liệu đầu vào không hợp lệ!",
                error: TOPICS_CONSTANTS.ERROR.MISSING_DATA
            }, HttpStatus.BAD_REQUEST)
        }
        createTopicDto.topic_major = teacher.user_major;

        const topic_group_student = createTopicDto.topic_group_student;

        // Nếu input có nhóm sinh viên thực hiện
        if (topic_group_student && topic_group_student.length > 0) {

            //Kiểm tra sinh viên đã có nhóm chưa (sinh viên đã đang ký đề tài khác)
            const existedGroup = await this.groupStudentFunction.isAnyStudentInGroup(topic_group_student)
            if (existedGroup && existedGroup.length > 0) {

                let msg = "*";
                for (const sv of existedGroup) {
                    const student = await this.userModel.findById(sv);
                    msg = msg + student.user_name + ", "
                }

                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Sinh viên ${msg.replace("*", "")}đã đăng ký đề tài!`,
                    error: TOPICS_CONSTANTS.ERROR.STUDENT_ALREADY_REGISTERED
                }, HttpStatus.BAD_REQUEST)
            }

            // Tạo group student mới
            const group_student = await this.groupStudentModel.create({
                group_member: createTopicDto.topic_group_student
            }
            )
            delete createTopicDto.topic_group_student;

            if (group_student) {
                createTopicDto.topic_group_student = [group_student._id.toString()]
            }
        }

        const topic: any = await this.topicModel.create(createTopicDto)

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tạo mới đề tài!",
                error: TOPICS_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        if (topic_group_student && topic_group_student.length > 0) {
            // Thông báo cho nhóm sinh viên khi giang viên đăng ký đề tài cho họ
            let title = `Bạn đã được ghi danh vào đề tài "${topic.topic_title}" `;
            let content = ` Bạn đã được ghi danh vào đề tài "${topic.topic_title}" do trưởng ngành khởi tạo.`
            await this.userNotificationFunction.createNotificationForManyUser(topic_group_student, {
                user_notification_title: title,
                user_notification_sender: currentUserId,
                user_notification_content: content,
                user_notification_topic: topic._id
            })
        }

        // Thông báo cho giảng viên hướng dãn
        let title = `Đề tài "${createTopicDto.topic_title}" đã được trưởng ngành tạo mới.`;
        let content = `Đề tài "${createTopicDto.topic_title}" do bạn hướng dẫn đã được trưởng ngành tạo mới.`
        await this.userNotificationFunction.createNotificationForUser({
            user_notification_title: title,
            user_notification_sender: currentUserId,
            user_notification_recipient: createTopicDto.topic_instructor,
            user_notification_content: content,
            user_notification_topic: topic._id
        })

        return {
            statusCode: HttpStatus.OK,
            message: "Tạo mới đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async leaderGetTopicByFilter(req) {

        const filter = req.body.filter;

        const topics = await this.topicModel
            .find(filter)
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy đề tài thành công!",
            error: null,
            data: {
                topics
            }
        }
    }

    async leaderUpdateTopic(req, id: string, updateTopicDto: Leader_UpdateTopicDto) {

        const currentUserId = req.currentUser._id
        this.validateUtils.validateObjectId(id);
        const topic_group_student = updateTopicDto.topic_group_student;

        const options = {
            new: true,
        };

        if (topic_group_student && topic_group_student.length > 0) {

            //Kiểm tra sinh viên đã có nhóm chưa (sinh viên đã đang ký đề tài khác)
            const existedGroup = await this.groupStudentFunction.isAnyStudentInGroup(topic_group_student)
            if (existedGroup && existedGroup.length > 0) {

                let msg = "*";
                for (const sv of existedGroup) {
                    const student = await this.userModel.findById(sv);
                    msg = msg + student.user_name + ", "
                }

                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Sinh viên ${msg.replace("*", "")}đã đăng ký đề tài!`,
                    error: TOPICS_CONSTANTS.ERROR.STUDENT_ALREADY_REGISTERED
                }, HttpStatus.BAD_REQUEST)
            }

            // Tạo group student mới
            const group_student = await this.groupStudentModel.create({
                group_member: topic_group_student
            }
            )
            delete updateTopicDto.topic_group_student;
            if (group_student) {
                updateTopicDto.topic_group_student = [group_student._id.toString()]
            }
        }

        const topic: any = await this.topicModel.findByIdAndUpdate(id, updateTopicDto, options);
        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể cập nhật đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        //Nếu thêm nhóm sinh viên cho đề tài thì thông báo đến nhóm sinh viên
        if (topic_group_student && topic_group_student.length > 0) {
            let title = `Bạn đã được ghi danh vào đề tài "${topic.topic_title}"`;
            let content = ` Bạn đã được ghi danh vào đề tài "${topic.topic_title}" do trưởng ngành cập nhật.`
            await this.userNotificationFunction.createNotificationForManyUser(topic_group_student, {
                user_notification_title: title,
                user_notification_sender: currentUserId,
                user_notification_content: content,
                user_notification_topic: topic._id
            })
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }

    }

    async leaderUpdateManyTopic(req) {

        const filter: any = req.body.filter || {};
        const dataUpdate: any = req.body.data;

        const options = {
            new: true
        };

        const topic: any = await this.topicModel.updateMany(filter, dataUpdate, options);

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể cập nhật các đề tài!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật các đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }

    }

    async leaderUpdateManyTopicsByIds(req) {
        try {
            const ids = req.body.ids;
            const dataUpdate = req.body.data;

            // Validate inputs
            if (!Array.isArray(ids) || !dataUpdate) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Đầu vào không hợp lệ!",
                    error: TOPICS_CONSTANTS.ERROR.MISSING_DATA
                }, HttpStatus.BAD_REQUEST);
            }

            // Tạo một loạt các lời hứa cho mỗi thao tác cập nhật
            const updatePromises = ids.map(async (id) => {
                const options = { new: true };
                return this.topicModel.findByIdAndUpdate(id, dataUpdate, options);
            });

            // Thực hiện song song tất cả các hoạt động cập nhật
            const results: any = await Promise.all(updatePromises);

            if (!results || results.length === 0) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Không thể cập nhật các đề tài!",
                    error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
                }, HttpStatus.BAD_REQUEST);
            }

            return {
                statusCode: HttpStatus.OK,
                message: "Cập nhật các đề tài thành công!",
                error: null,
                data: {
                    topics: results.map(result => result._id)
                }
            };
        } catch (error) {
            // Handle errors here
            console.error(error);
            throw error;
        }
    }


    async leaderFindAll(skip: number, limit: number, sort: number) {

        const topics = await this.topicModel.find()
            .skip(skip)
            .limit(limit)
            .sort({ "topic_title": sort === 1 ? 1 : -1 })
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        // Sử dụng countDocuments() để đếm tổng số lượng bản ghi
        const total = await this.topicModel.countDocuments();

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy tất cả đề tài thành công!",
            error: null,
            data: {
                topics,
                total
            }
        }
    }

    async leaderApproveGroupStudentForProject(req) {

        const currentUserId = req.currentUser._id
        const { group_student_id } = req.body;

        //Tìm topic của nhóm sinh viên
        const currentTopic: any = await this.topicModel.findOne({
            topic_group_student: {
                $in: group_student_id
            }
        })

        if (!currentTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tìm thấy đề tài của nhóm sinh viên!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        // Xóa các nhóm không đạt khỏi đề tài
        const topic = await this.topicModel.findByIdAndUpdate(
            currentTopic._id,
            {
                $pull: {
                    topic_group_student: {
                        $ne: group_student_id
                    }
                }
            },
            { new: true }
        );

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể duyệt nhóm thực hiện đề tài đề tài!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        let group_student_ids = currentTopic.topic_group_student.filter(group => group != group_student_id)

        // Thông báo đến nhóm sinh viên không đạt yêu cầu
        let titleRefuse = `Nhóm của bạn không đủ điều kiện để thực hiện để tài ${currentTopic.topic_title}.`;
        let contentRefuse = `Thông báo!
        Nhóm của bạn hiện không đáp ứng đủ điều kiện để thực hiện đề tài "${currentTopic.topic_title}".
        Tuy nhiên, bạn có thể tham gia đăng ký một đề tài khác trong kỳ đăng ký.
        Chúng tôi rất trân trọng sự quan tâm của bạn đối với đề tài này.`
        await this.userNotificationFunction.createNotificationForMemberOfManyGroup(
            group_student_ids,
            {
                user_notification_title: titleRefuse,
                user_notification_sender: currentUserId,
                user_notification_content: contentRefuse,
                user_notification_topic: currentTopic._id
            })

        // Xóa các nhóm sinh viên không đạt yêu cầu
        await this.groupStudentModel.deleteMany({
            _id: { $in: group_student_ids }
        });

        // Thông báo đến nhóm sinh viên được chấp nhận thực hiện đề tài
        let titleApprove = `Nhóm của bạn đã được duyệt thực hiện đề tài ${currentTopic.topic_title}.`;
        let contentApprove = ` Thông báo chúc mừng! 
        Nhóm của bạn đã được phê duyệt để thực hiện đề tài "${currentTopic.topic_title}". 
        Bây giờ, các bạn có thể bắt đầu quá trình nghiên cứu và thực hiện đề tài này.
        Đề nghị liên hệ với giảng viên hướng dẫn của bạn để nhận nhiệm vụ cụ thể và sự hỗ trợ. 
        Chúng tôi rất trân trọng sự đăng ký và sự cam kết của bạn đối với đề tài này.`
        await this.userNotificationFunction.createNotificationForMemberOfOneGroup(
            group_student_id,
            {
                user_notification_title: titleApprove,
                user_notification_sender: currentUserId,
                user_notification_content: contentApprove,
                user_notification_topic: currentTopic._id
            })

        return {
            statusCode: HttpStatus.OK,
            message: "Duyệt nhóm thực hiện đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    // =============================================================
    async findDuplicateTopics(topics: any) {
        const topicMap = new Map();
        const duplicateTopics = [];

        topics.forEach((topic, index) => {
            const key = `${topic.topic_assembly}_${topic.topic_room}_${topic.topic_date}_${topic.topic_time_start}`;

            if (topicMap.has(key)) {
                const existingIndex = topicMap.get(key);
                duplicateTopics.push([existingIndex, index]);
                return duplicateTopics;
            } else {
                topicMap.set(key, index);
            }
        });

        return duplicateTopics;
    }

    async findDuplicateTopicsInDB(topics: any[]) {
        const topicMap = new Map();
        const duplicateTopics = [];

        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            const key = `${topic.topic_assembly}_${topic.topic_room}_${topic.topic_date}_${topic.topic_time_start}`;

            const existingTopic = await this.topicModel.findOne({
                $and: [
                    { topic_assembly: topic.topic_assembly },
                    { topic_room: topic.topic_room },
                    { topic_date: topic.topic_date },
                    { topic_time_start: topic.topic_time_start },
                    { _id: { $ne: topic._id } }
                ]
            });

            if (existingTopic) {
                duplicateTopics.push({
                    existingIndex: i,
                    existingTopic: existingTopic.toObject() // Convert Mongoose document to plain object
                });
                return duplicateTopics;
            } else {
                topicMap.set(key, i);
            }
        }

        return duplicateTopics;
    }

    async leaderUpdateInfoAssemblyForTopics(req: any) {
        try {

            const dataUpdate: any = req.body.data;

            // Validate inputs
            if (!dataUpdate || dataUpdate.length === 0) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Đầu vào không hợp lệ!",
                    error: TOPICS_CONSTANTS.ERROR.MISSING_DATA
                }, HttpStatus.BAD_REQUEST);
            }

            // Kiểm tra input trùng
            const duplicateTopics: any = await this.findDuplicateTopics(dataUpdate);

            if (duplicateTopics.length > 0) {
                duplicateTopics.forEach(pair => {
                    const [position1, position2] = pair;
                    throw new HttpException({
                        statusCode: HttpStatus.BAD_REQUEST,
                        message: `Đầu vào không hợp lệ . Đề tài số ${position1 + 1} và đề tài số ${position2 + 1} trùng thời gian và địa điểm!`,
                        error: TOPICS_CONSTANTS.ERROR.MISSING_DATA
                    }, HttpStatus.BAD_REQUEST);
                });
            }

            // Kiểm tra input trùng với topic trong db
            const duplicateTopicDB: any = await this.findDuplicateTopicsInDB(dataUpdate);

            if (duplicateTopicDB.length > 0) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Đề tài số ${duplicateTopicDB[0].existingIndex + 1} trùng thời gian và địa điểm với để tài ${duplicateTopicDB[0].existingTopic.topic_title} đã phân trước đó!`,
                    error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL,
                }, HttpStatus.BAD_REQUEST);
            }

            // Tạo một loạt các lời hứa cho mỗi thao tác cập nhật
            const updatePromises = dataUpdate.map(async (topic: any) => {
                const options = { new: true };
                const _id = topic.topic_id;
                delete topic.topic_id;
                return this.topicModel.findByIdAndUpdate(_id, topic, options);
            });

            // Thực hiện song song tất cả các hoạt động cập nhật
            const results: any = await Promise.all(updatePromises);

            if (!results || results.length === 0) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Không thể cập nhật các đề tài!",
                    error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
                }, HttpStatus.BAD_REQUEST);
            }

            return {
                statusCode: HttpStatus.OK,
                message: "Cập nhật các đề tài thành công!",
                error: null,
                data: {
                    topics: results.map(result => result._id)
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // =========================TEACHER ==================================

    async teacherCreate(req, createTopicDto: Teacher_CreateTopicDto) {

        const currentUserId = req.currentUser._id;
        const topic_group_student = createTopicDto.topic_group_student;

        // Mặc đinh giảng viên tạo sẽ là người tạo và người hướng dẫn
        createTopicDto.topic_creator = currentUserId;
        createTopicDto.topic_instructor = currentUserId;

        // Lấy chuyên ngành của giảng viên 
        const teacher = await this.userModel.findById(currentUserId);
        createTopicDto.topic_major = teacher.user_major;

        // Nếu input có nhóm sinh viên thực hiện
        if (topic_group_student && topic_group_student.length > 0) {

            //Kiểm tra sinh viên đã có nhóm chưa (sinh viên đã đang ký đề tài khác)
            const existedGroup = await this.groupStudentFunction.isAnyStudentInGroup(createTopicDto.topic_group_student)
            if (existedGroup && existedGroup.length > 0) {

                let msg = "*";
                for (const sv of existedGroup) {
                    const student = await this.userModel.findById(sv);
                    msg = msg + student.user_name + ", "
                }

                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Sinh viên ${msg.replace("*", "")}đã đăng ký đề tài!`,
                    error: TOPICS_CONSTANTS.ERROR.STUDENT_ALREADY_REGISTERED
                }, HttpStatus.BAD_REQUEST)
            }

            // Tạo group student mới
            const group_student = await this.groupStudentModel.create({
                group_member: createTopicDto.topic_group_student
            }
            )
            delete createTopicDto.topic_group_student;
            if (group_student) {
                createTopicDto.topic_group_student = [group_student._id.toString()]
            }
        }

        const topic: any = await this.topicModel.create(createTopicDto)

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tạo mới đề tài!",
                error: TOPICS_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        if (topic_group_student && topic_group_student.length > 0) {
            // Thông báo cho nhóm sinh viên khi giang viên đăng ký đề tài cho họ
            let title = `Bạn đã được ghi danh vào đề tài "${topic.topic_title}" `;
            let content = ` Bạn đã được ghi danh vào đề tài "${topic.topic_title}" do giảng viên khởi tạo.`
            await this.userNotificationFunction.createNotificationForManyUser(topic_group_student, {
                user_notification_title: title,
                user_notification_sender: currentUserId,
                user_notification_content: content,
                user_notification_topic: topic._id
            })
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Tạo mới đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async teacherGetTopicByFilter(req) {

        const filter = req.body.filter;
        const currentUserId = req.currentUser._id;

        // Chỉ lấy những đề tài do chính mình hướng dẫn
        filter.topic_instructor = currentUserId;

        const topics = await this.topicModel
            .find(filter)
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đề tài thành công!",
            error: null,
            data: {
                topics
            }
        }
    }

    async teacherUpdateTopic(req, id: string, updateTopicDto: Teacher_UpdateTopicDto) {

        const currentUserId = req.currentUser._id;
        const topic_group_student = updateTopicDto.topic_group_student;

        this.validateUtils.validateObjectId(id);

        const options = {
            new: true,
        };

        // Không cho update người tạo và người hướng dẫn
        delete updateTopicDto.topic_creator;
        delete updateTopicDto.topic_instructor;

        const existedTopic: any = await this.topicModel.findById(id).lean();
        if (!existedTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tìm thấy đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        //Không cho phép update topic không do mình hướng dẫn
        if (existedTopic.topic_instructor.toString() !== currentUserId) {
            throw new HttpException({
                statusCode: HttpStatus.FORBIDDEN,
                message: "Không được phép thực hiện hành dộng này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.FORBIDDEN)
        }


        // Nếu cập nhật nhóm sinh viên thực hiện đề tài
        if (topic_group_student && topic_group_student.length > 0) {

            //Kiểm tra sinh viên đã có nhóm chưa (sinh viên đã đang ký đề tài khác)
            const existedGroup = await this.groupStudentFunction.isAnyStudentInGroup(topic_group_student)
            if (existedGroup && existedGroup.length > 0) {

                let msg = "*";
                for (const sv of existedGroup) {
                    const student = await this.userModel.findById(sv);
                    msg = msg + student.user_name + ", "
                }

                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Sinh viên ${msg.replace("*", "")}đã đăng ký đề tài!`,
                    error: TOPICS_CONSTANTS.ERROR.STUDENT_ALREADY_REGISTERED
                }, HttpStatus.BAD_REQUEST)
            }

            // Tạo group student mới
            const group_student = await this.groupStudentModel.create({
                group_member: topic_group_student
            })

            delete updateTopicDto.topic_group_student;
            if (group_student) {
                updateTopicDto.topic_group_student = [group_student._id.toString()]
                //Xóa các group_student cũ 
                if (existedTopic.topic_group_student.length > 0) {
                    await this.groupStudentModel.deleteMany({ _id: { $in: existedTopic.topic_group_student } })
                }

            }

        }

        const topic: any = await this.topicModel
            .findByIdAndUpdate(id, updateTopicDto, options)
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể cập nhật đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        //Nếu thêm nhóm sinh viên cho đề tài thì thông báo đến nhóm sinh viên
        if (topic_group_student && topic_group_student.length > 0) {
            let title = `Bạn đã được ghi danh vào đề tài "${topic.topic_title}" `;
            let content = ` Bạn đã được ghi danh vào đề tài "${topic.topic_title}" do giảng viên cập nhật.`
            await this.userNotificationFunction.createNotificationForManyUser(topic_group_student, {
                user_notification_title: title,
                user_notification_sender: currentUserId,
                user_notification_content: content,
                user_notification_topic: topic._id
            })
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }

    }

    async teacherRemoveTopic(req, id: string) {

        const currentUserId = req.currentUser._id;

        this.validateUtils.validateObjectId(id);

        const exitedTopic: any = await this.topicModel.findById(id).lean();

        if (!exitedTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tìm thấy đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        //Không cho phép xóa topic của người khác
        if (exitedTopic.topic_creator.toString() !== currentUserId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thực hiện hành dộng này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)

        }

        const topic = await this.topicModel.findByIdAndDelete(id).lean();

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể xóa đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        //Thông báo đến sinh viên các nhóm đăng ký đề tài này
        if (exitedTopic.topic_group_student && exitedTopic.topic_group_student.length > 0) {

            let title = `Đề tài ${exitedTopic.topic_title} đã bị xóa`;
            let content = `Đề tài bạn đã đăng ký "${exitedTopic.topic_title}" đã bị xóa bởi giảng viên hướng dẫn.`
            await this.userNotificationFunction.createNotificationForMemberOfManyGroup(
                exitedTopic.topic_group_student,
                {
                    user_notification_title: title,
                    user_notification_sender: currentUserId,
                    user_notification_content: content,
                    user_notification_topic: exitedTopic._id
                })

            // Xóa các nhóm sinh viên trong đề tài
            await this.groupStudentModel.deleteMany({
                _id: { $in: exitedTopic.topic_group_student }
            });
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async teacherRemoveGroupFromTopic(req) {

        const currentUserId = req.currentUser._id;
        const { topic_id, group_student_id } = req.body;

        // Không thể xóa nhóm sinh viên của topic do người khác hướng dẫn
        const validTopic = await this.topicModel.findOne({
            _id: topic_id,
            topic_instructor: currentUserId
        })

        if (!validTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thực hiện hành dộng này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)
        }

        // Xóa nhóm khỏi để tài
        const topic: any = await this.topicModel.findByIdAndUpdate(
            topic_id,
            { $pull: { topic_group_student: group_student_id } },
            { new: true }
        );

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể xóa nhóm ra khỏi đề tài!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        let title = `Nhóm của bạn không đủ điều kiện để thực hiện để tài "${topic.topic_title}".`;
        let content = `Thông báo nhóm của bạn không đủ điều kiện để thực hiện đề tài "${topic.topic_title}". 
        Các bạn có thể đăng ký đề tài khác trong đợt đăng ký. 
        Cảm ơn các bạn đăng ký đề tài này.`
        await this.userNotificationFunction.createNotificationForMemberOfOneGroup(
            group_student_id,
            {
                user_notification_title: title,
                user_notification_sender: currentUserId,
                user_notification_content: content,
                user_notification_topic: topic._id
            })

        // Xóa nhóm sinh viên thực hiện đề tài
        await this.groupStudentModel.findByIdAndDelete(group_student_id)

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa nhóm khỏi đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async teacherApproveGroupStudentForProject(req) {

        const currentUserId = req.currentUser._id;
        const { group_student_id } = req.body;

        //Tìm topic của nhóm sinh viên
        const currentTopic: any = await this.topicModel.findOne({
            topic_group_student: {
                $in: group_student_id
            }
        })

        if (!currentTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tìm thấy đề tài của nhóm sinh viên!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        // Không thể phê duyệt nhóm sinh viên của topic do người khác hướng dẫn
        if (currentTopic.topic_instructor != currentUserId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thực hiện hành dộng này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)
        }

        // Xóa các nhóm không đạt khỏi đề tài
        const topic: any = await this.topicModel.findByIdAndUpdate(
            currentTopic._id,
            {
                $pull: {
                    topic_group_student: {
                        $ne: group_student_id
                    }
                }
            },
            { new: true }
        );

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể duyệt nhóm thực hiện đề tài đề tài!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        // Thông báo đến nhóm sinh viên được chấp nhận thực hiện đề tài
        let titleApprove = `Nhóm của bạn đã được duyệt thực hiện đề tài ${currentTopic.topic_title}.`;
        let contentApprove = `Thông báo!.
        Qua quá trình xem xét nhóm các bạn đã được duyệt thực hiện đề tài "${currentTopic.topic_title}". 
        Các bạn có thể bắt đầu tìm hiểu và thực hiện đề tài.
        Vui lòng liên hệ với giảng viên hướng dẫn để nhận nhiệm vụ. 
        Cảm ơn các bạn đăng ký đề tài này.`
        await this.userNotificationFunction.createNotificationForMemberOfOneGroup(
            group_student_id,
            {
                user_notification_title: titleApprove,
                user_notification_sender: currentUserId,
                user_notification_content: contentApprove,
                user_notification_topic: currentTopic._id
            })

        // Các nhóm sinh viên không đạt yêu cầu
        let group_student_ids = currentTopic.topic_group_student.filter(group => group != group_student_id)

        // Thông báo đến nhóm sinh viên không đạt yêu cầu
        let titleRefuse = `Nhóm của bạn không đủ điều kiện để thực hiện để tài ${currentTopic.topic_title}.`;
        let contentRefuse = `Thông báo nhóm của bạn không đủ điều kiện để thực hiện đề tài "${currentTopic.topic_title}".
        Các bạn có thể đăng ký đề tài khác trong đợt đăng ký.
        Cảm ơn các bạn đăng ký đề tài này.`
        await this.userNotificationFunction.createNotificationForMemberOfManyGroup(
            group_student_ids,
            {
                user_notification_title: titleRefuse,
                user_notification_sender: currentUserId,
                user_notification_content: contentRefuse,
                user_notification_topic: currentTopic._id
            })

        // Xóa các nhóm sinh viên không đạt yêu cầu
        await this.groupStudentModel.deleteMany({
            _id: { $in: group_student_ids }
        });

        return {
            statusCode: HttpStatus.OK,
            message: "Duyệt nhóm thực hiện đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async getTopicsReview(req) {

        const currentUserId = req.currentUser._id;

        const topics = await this.topicModel.find({
            topic_reviewer: currentUserId
        })
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đề tài thành công!",
            error: null,
            data: {
                topics,
                total: topics.length
            }
        }
    }

    async getTopicsAssembly(req) {

        const currentUserId = req.currentUser._id;

        const topicIds = await this.assemblyFunction.listAssemblyOfTeacher(currentUserId);

        let topics: any = await this.topicModel.find({
            topic_assembly: { $in: topicIds }
        })
            .populate("topic_assembly topic_category topic_major")
            .populate(
                "topic_creator topic_instructor topic_reviewer",
                "_id user_name user_avatar user_faculty user_major"
            )
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        // Đính kèm role của giảng viên trong hội đồng
        topics = await Promise.all(topics.map(async (topic: any) => {
            const role = await this.assemblyFunction.getRoleOfTeacherInAssembly(topic.topic_assembly, currentUserId);
            return {
                ...topic,
                role_assembly: role
            };
        }));

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đề tài thành công!",
            error: null,
            data: {
                topics,
                total: topics.length
            }
        }
    }

    // =======================STUDENT =======================================

    async studentCreate(req, createTopicDto: Student_CreateTopicDto) {

        const currentUser = req.currentUser._id;
        createTopicDto.topic_creator = currentUser;

        // Lấy chuyên ngành của giảng viên 
        const teacher = await this.userModel.findById(createTopicDto.topic_instructor);
        if (!teacher) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Dữ liệu đầu vào không hợp lệ!",
                error: TOPICS_CONSTANTS.ERROR.MISSING_DATA
            }, HttpStatus.BAD_REQUEST)
        }
        createTopicDto.topic_major = teacher.user_major;

        //Kiểm tra sinh viên đã có nhóm chưa (sinh viên đã đang ký đề tài khác)
        const existedGroup = await this.groupStudentFunction.isAnyStudentInGroup(createTopicDto.topic_group_student)

        if (existedGroup.length > 0) {
            let msg = "*";

            for (const sv of existedGroup) {
                const student = await this.userModel.findById(sv);
                msg = msg + student.user_name + ", "
            }

            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Sinh viên ${msg.replace("*", "")}đã đăng ký đề tài!`,
                error: TOPICS_CONSTANTS.ERROR.STUDENT_ALREADY_REGISTERED
            }, HttpStatus.BAD_REQUEST)
        }

        // Tạo group student mới
        const group_student = await this.groupStudentModel.create({
            group_member: createTopicDto.topic_group_student
        })

        delete createTopicDto.topic_group_student;
        if (group_student) {
            createTopicDto.topic_group_student = [group_student._id.toString()]
        }

        const topic = await this.topicModel.create(createTopicDto)

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tạo mới đề tài!",
                error: TOPICS_CONSTANTS.ERROR.CREATED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        // Thông báo cho người dùng
        let title = `Sinh viên đề xuất đề tài "${createTopicDto.topic_title}" và mong muốn được hướng dẫn`;
        let content = ` Có nhóm đề xuất đề tài "${createTopicDto.topic_title}", và mong muốn được hướng dẫn.`
        await this.userNotificationFunction.createNotificationForUser({
            user_notification_title: title,
            user_notification_sender: currentUser,
            user_notification_recipient: createTopicDto.topic_instructor,
            user_notification_content: content,
            user_notification_topic: topic._id
        })

        return {
            statusCode: HttpStatus.OK,
            message: "Tạo mới đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async studentGetTopicOneTeacher(id) {

        const { idTeacher } = id;

        const topics: any[] = await this.topicModel
            .find({
                topic_instructor: idTeacher,
                topic_teacher_status: TOPICS_CONSTANTS.TEACHER_STATUS.READY
            })
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đề tài của giảng viên thành công!",
            error: null,
            data: {
                topics,
                total: topics.length
            }
        }
    }

    async studentUpdateTopic(req, id: string, updateTopicDto: Student_UpdateTopicDto) {

        const currentUser = req.currentUser._id;

        // Không cho update nhóm thực hiện đề tài
        delete updateTopicDto.topic_group_student;

        this.validateUtils.validateObjectId(id);

        const options = {
            new: true,
        };

        const existedTopic: any = await this.topicModel.findById(id).lean();
        if (!existedTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tìm thấy đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        //Không cho phép update topic của người khác
        if (existedTopic.topic_creator.toString() !== currentUser) {
            throw new HttpException({
                statusCode: HttpStatus.FORBIDDEN,
                message: "Không được phép thực hiện hành động này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.FORBIDDEN)
        }

        const topic = await this.topicModel.findByIdAndUpdate(id, updateTopicDto, options).lean();

        // Thông báo cho người dùng
        let title = "Sinh viên cập nhật đề tài của sinh viên đề xuất";
        let content = ` Sinh viên thực hiện cập nhật đề tài "${existedTopic.topic_title}".`
        await this.userNotificationFunction.createNotificationForUser({
            user_notification_title: title,
            user_notification_sender: currentUser,
            user_notification_recipient: existedTopic.topic_instructor,
            user_notification_content: content,
            user_notification_topic: existedTopic._id
        })

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }

    }

    async studentRemoveTopic(req, id: string) {

        const currentUserId = req.currentUser._id;

        this.validateUtils.validateObjectId(id);

        const exitedTopic: any = await this.topicModel.findById(id).lean();

        if (!exitedTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể tìm thấy đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        //Không cho phép xóa topic của người khác
        if (exitedTopic.topic_creator.toString() !== currentUserId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thực hiện hành dộng này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)

        }

        const topic = await this.topicModel.findByIdAndDelete(id).lean();

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể xóa đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        if (exitedTopic.topic_group_student && exitedTopic.topic_group_student.length > 0) {
            // Xóa các nhóm sinh viên trong đề tài
            await this.groupStudentModel.deleteMany({
                _id: { $in: exitedTopic.topic_group_student }
            });
        }

        // Thông báo cho người dùng
        let title = `Sinh viên hủy đề tài "${exitedTopic.topic_title}"`;
        let content = ` Sinh viên thực hiện hủy đề tài "${exitedTopic.topic_title}".`
        await this.userNotificationFunction.createNotificationForUser({
            user_notification_title: title,
            user_notification_sender: currentUserId,
            user_notification_recipient: currentUserId.topic_instructor,
            user_notification_content: content,
            user_notification_topic: currentUserId._id
        })

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async studentRegisterTopic(req) {

        const { id, group_student } = req.body;
        this.validateUtils.validateObjectId(id);

        if (!group_student || group_student.length === 0) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Vui lòng chọn sinh viên để đăng ký đề tài!",
                error: TOPICS_CONSTANTS.ERROR.MISSING_DATA
            }, HttpStatus.BAD_REQUEST)
        }

        //Kiểm tra kiểm tra trùng lặp id
        const validGroup = await this.groupStudentFunction.checkGroupStudentDuplicateIds(group_student);
        if (!validGroup) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Có sinh viên bị trùng lặp trong nhóm!",
                error: TOPICS_CONSTANTS.ERROR.GROUP_STUDENT_DUPLICATE_ID
            }, HttpStatus.BAD_REQUEST)
        }

        //Kiểm tra sinh viên đã có nhóm chưa (sinh viên đã đang ký đề tài khác)
        const existedGroup = await this.groupStudentFunction.isAnyStudentInGroup(group_student)
        if (existedGroup && existedGroup.length > 0) {

            let msg = "*";
            for (const sv of existedGroup) {
                const student = await this.userModel.findById(sv);
                msg = msg + student.user_name + ", "
            }

            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Sinh viên ${msg.replace("*", "")}đã đăng ký đề tài!`,
                error: TOPICS_CONSTANTS.ERROR.STUDENT_ALREADY_REGISTERED
            }, HttpStatus.BAD_REQUEST)
        }

        // Tạo group student mới
        const newGroupStudent = await this.groupStudentModel.create({
            group_member: group_student
        });

        if (newGroupStudent) {

            // Thêm id group_student vào topic
            const topic: any = await this.topicModel.findByIdAndUpdate(
                id,
                { $push: { topic_group_student: newGroupStudent._id } },
                { new: true }
            );

            if (!topic) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "không thể đăng ký đề tài này!",
                    error: TOPICS_CONSTANTS.ERROR.REGISTERED_FAIL
                }, HttpStatus.BAD_REQUEST)
            }

            // Thông báo cho người dùng
            let title = `Có nhóm sinh viên ghi danh vào đề tài "${topic.topic_title}".`;
            let content = ` Có nhóm sinh viên ghi danh vào đề tài "${topic.topic_title}".`
            await this.userNotificationFunction.createNotificationForUser({
                user_notification_title: title,
                user_notification_sender: null,
                user_notification_recipient: topic.topic_instructor,
                user_notification_content: content,
                user_notification_topic: topic._id
            })

            return {
                statusCode: HttpStatus.OK,
                message: "Đăng ký đề tài thành công!",
                error: null,
                data: {
                    topic
                }
            };
        } else {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Đăng ký đề tài thất bại!",
                error: TOPICS_CONSTANTS.ERROR.REGISTERED_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

    }

    async getMyRegisteredTopics(req) {

        const currentUserId = req.currentUser._id;

        // Lấy group_student của sinh viên đang tham gia
        const currentGroup: any = await this.groupStudentModel.findOne({
            group_member: {
                $in: currentUserId
            }
        })

        if (!currentGroup) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Chưa đăng ký đề tài nào!",
                error: TOPICS_CONSTANTS.ERROR.NO_REGISTERED_TOPICS
            }, HttpStatus.BAD_REQUEST)
        }

        // Lấy topic của sinh viên
        const currentTopic = await this.topicModel.find({
            topic_group_student: {
                $in: currentGroup._id
            }
        })
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        if (!currentTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Chưa đăng ký đề tài nào!",
                error: TOPICS_CONSTANTS.ERROR.NO_REGISTERED_TOPICS
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy đề tài đã đăng ký thành công!",
            error: null,
            data: {
                topic: currentTopic
            }
        }
    }

    async studentCancelProjectRegistration(req) {

        const currentUserId = req.currentUser._id;
        const { topic_id, group_student_id } = req.body;

        const groupOfUser = await this.groupStudentModel.findOne({
            _id: group_student_id,
            group_member: {
                $in: currentUserId
            }
        });

        if (!groupOfUser) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thưc hiện hành động này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)
        }

        // Xóa nhóm khỏi để tài
        const topic: any = await this.topicModel.findByIdAndUpdate(
            topic_id,
            { $pull: { topic_group_student: group_student_id } },
            { new: true }
        );

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể hủy đăng ký đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        // Thông báo cho người dùng
        let title = "Có nhóm sinh viên hủy ghi danh đề tài";
        let content = ` Có nhóm sinh viên đã hủy ghi danh vào đề tài "${topic.topic_title}".`
        await this.userNotificationFunction.createNotificationForUser({
            user_notification_title: title,
            user_notification_sender: currentUserId,
            user_notification_recipient: topic.topic_instructor,
            user_notification_content: content,
            user_notification_topic: topic._id
        })

        // Xóa nhóm sinh viên thực hiện đề tài
        await this.groupStudentModel.findByIdAndDelete(group_student_id)

        return {
            statusCode: HttpStatus.OK,
            message: "Hủy đăng ký đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async studentGetAll(skip: number, limit: number, sort: number) {

        // Chỉ lấy những đề tài đã được trưởng ngành duyệt
        const topics = await this.topicModel.find({
            topic_teacher_status: TOPICS_CONSTANTS.TEACHER_STATUS.READY,// Sẵn sàng đăng ký
            topic_leader_status: TOPICS_CONSTANTS.LEADER_STATUS.ACTIVE// Đã được leader duyệt
        })
            .skip(skip)
            .limit(limit)
            .sort({ "topic_title": sort === 1 ? 1 : -1 })
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        // Sử dụng countDocuments() để đếm tổng số lượng bản ghi
        const total = await this.topicModel.countDocuments({
            topic_leader_status: TOPICS_CONSTANTS.LEADER_STATUS.ACTIVE
        });

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đề tài thành công!",
            error: null,
            data: {
                topics,
                total
            }
        }
    }

    //=======================================================================

    async getTopicOfTeacher(id) {

        const { idTeacher } = id;

        const topics: any[] = await this.topicModel
            .find({ topic_instructor: idTeacher })
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đề tài của giảng viên thành công!",
            error: null,
            data: {
                topics,
                total: topics.length
            }
        }
    }

    async findAll(skip: number, limit: number, sort: number) {

        const topics = await this.topicModel.find({
            topic_leader_status: TOPICS_CONSTANTS.LEADER_STATUS.ACTIVE
        })
            .skip(skip)
            .limit(limit)
            .sort({ "topic_title": sort === 1 ? 1 : -1 })
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        // Sử dụng countDocuments() để đếm tổng số lượng bản ghi
        const total = await this.topicModel.countDocuments({
            topic_leader_status: TOPICS_CONSTANTS.LEADER_STATUS.ACTIVE
        });

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy danh sách đề tài thành công!",
            error: null,
            data: {
                topics,
                total
            }
        }
    }

    async findOne(id: string) {

        this.validateUtils.validateObjectId(id);

        const topic = await this.topicModel.findById(id)
            .populate("topic_assembly topic_category topic_major")
            .populate({
                path: "topic_creator topic_instructor topic_reviewer",
                select: "_id user_name user_avatar user_average_grade user_id user_phone email",
                populate: {
                    path: 'user_faculty user_major',
                }
            })
            .populate({
                path: 'topic_registration_period',
                populate: {
                    path: 'registration_period_semester'
                }
            })
            .populate({
                path: 'topic_group_student',
                populate: {
                    path: 'group_member',
                    select: "_id user_name user_avatar user_average_grade user_id"
                }
            })
            .lean()

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Không tìm thấy đề tài với id: ${id}`,
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Lấy đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async remove(id: string) {

        this.validateUtils.validateObjectId(id);

        const exitedTopic: any = await this.topicModel.findById(id).lean();

        if (!exitedTopic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể xóa đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        //Thông báo đến sinh viên các nhóm đăng ký đề tài này
        if (exitedTopic.topic_group_student && exitedTopic.topic_group_student.length > 0) {

            let title = `Đề tài ${exitedTopic.topic_title} đã bị xóa bởi truưởng ngành`;
            let content = `Đề tài bạn đã đăng ký "${exitedTopic.topic_title}" đã bị xóa bởi bởi truưởng ngành.`
            await this.userNotificationFunction.createNotificationForMemberOfManyGroup(
                exitedTopic.topic_group_student,
                {
                    user_notification_title: title,
                    user_notification_sender: null,
                    user_notification_content: content,
                    user_notification_topic: exitedTopic._id
                })

            // Xóa các nhóm sinh viên trong đề tài
            await this.groupStudentModel.deleteMany({
                _id: { $in: exitedTopic.topic_group_student }
            });
        }

        const topic = await this.topicModel.findByIdAndDelete(id).lean();

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không thể xóa đề tài này!",
                error: TOPICS_CONSTANTS.ERROR.DELETE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Xóa đề tài thành công!",
            error: null,
            data: {
                topic
            }
        }
    }

    async removeAll() {
        await this.topicModel.deleteMany({})
        return {
            statusCode: HttpStatus.OK,
            message: "Xóa tất cả đề tài thành công!",
            error: null,
            data: {}
        }
    }

    async studentUploadFileForTopic(req, fileUrl: string) {

        const currentUserId = req.currentUser._id;
        const { topic_id, update_field } = req.body;

        // Kiểm tra xem sinh viên có thuộc topic này không
        const topicOfUser = await this.topicModel.findById(topic_id);
        if (!topicOfUser) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không tìm thấy đề tài!",
                error: TOPICS_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        if (topicOfUser.topic_group_student.length > 1) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Chỉ được 1 nhóm thực hiện đề tài, vui lòng kiểm tra lại!",
                error: TOPICS_CONSTANTS.ERROR.BAD_REQUEST
            }, HttpStatus.BAD_REQUEST)
        }

        const groupOfUser = await this.groupStudentModel.findById(topicOfUser.topic_group_student[0]);

        const allowField = [
            "topic_advisor_request",
            "topic_defense_request",
            "topic_final_report"
        ];

        if (!allowField.includes(update_field) || !groupOfUser.group_member.includes(currentUserId)) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thực hiện hành động này!",
                error: TOPICS_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)
        }

        let updateData = {}
        updateData[update_field] = fileUrl

        const topic = await this.topicModel.findByIdAndUpdate(
            topic_id,
            updateData,
            { new: true }
        )

        if (!topic) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Tải lên tập tin thất bại!",
                error: TOPICS_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Tải lên tập tin thành công!",
            error: null,
            data: {
                topic
            }
        }

    }
}
