import { HttpException, HttpStatus, Injectable, Req, Res } from "@nestjs/common";
import * as path from 'path';
import * as Excel from 'exceljs'
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import * as fs from 'fs';
import * as moment from 'moment';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { IUser } from "./interface/user.interface";
import { AuthUtils } from "../../utils/auth.utils";
import { ValidateUtils } from "../../utils/validate.utils";
import { USER_CONSTANTS } from "./constant/users.constant"
import { ITopic } from "../topics/interface/topic.interface";
import { AssemblyFunction } from "../assembly/assembly.function";

@Injectable()
export class UsersService {

    constructor(
        @InjectModel('User') private userModel: Model<IUser>,
        @InjectModel("Topic") private topicModel: Model<ITopic>,
        private authUtils: AuthUtils,
        private validateUtils: ValidateUtils,
        private assemblyFunction: AssemblyFunction,
    ) {
    }

    async signup(createUserDto: CreateUserDto) {
        const { email, password } = createUserDto;

        //Check email exist
        const emailExist = await this.userModel.findOne({ email }).exec();
        if (emailExist) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Email already exist!",
                error: USER_CONSTANTS.ERROR.EXISTED
            }, HttpStatus.BAD_REQUEST)
        }

        //Hash password
        const passHash = await this.authUtils.hashPassword(password)
        createUserDto.password = passHash;

        //create new user
        const newUser = await this.userModel.create(createUserDto)

        return {
            statusCode: HttpStatus.OK,
            message: "Register user successfully!",
            error: null,
            data: {
                user: newUser
            }
        }

    }

    async login(user: any) {
        const { email, password } = user;

        //Check user exist in db
        const userExist = await this.userModel.findOne({ email }).exec();
        if (!userExist) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "User is not registered!",
                error: USER_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }


        const isMatch = await this.authUtils.comparePassword(password, userExist.password)

        if (!isMatch) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Incorrect password!",
                error: USER_CONSTANTS.ERROR.INCORRECT_PASSWORD
            }, HttpStatus.BAD_REQUEST)
        }

        const access_token = await this.authUtils.createAccessToken({ _id: userExist._id, role: userExist.role });

        return {
            statusCode: HttpStatus.OK,
            message: "Login successfully!",
            error: null,
            data: {
                user: userExist,
                token: access_token
            }
        }

    }

    //Admin moi co the get all
    async findAll() {
        const users = await this.userModel.find()
        return {
            statusCode: HttpStatus.OK,
            message: "Get all users successfully!",
            error: null,
            data: {
                users
            }
        }
    }


    async leaderInsertUserByExcel(req, fileUrl: string) {
        try {

            const filePath = path.resolve(__dirname, `../../../uploads/${fileUrl}`);

            const getCellValue = (row: Excel.Row, cellIndex: number) => {
                const cell = row.getCell(cellIndex);
                return cell.value ? cell.value.toString() : '';
            };

            const processMajor = (key: string) => {
                switch (key) {
                    case 'CNPM':
                        return "6490178d453ec0d2f9f5fb01";
                    case 'ATTT':
                        return "6490178d453ec0d2f9f5fb01";
                    default:
                        return null;
                }
            };

            const processFaculty = (key: string) => {
                switch (key) {
                    case 'CNTT':
                        return "6482c65ee0e664274270c8ce";
                    default:
                        return null;
                }
            };

            const workbook = new Excel.Workbook();
            const content = await workbook.xlsx.readFile(filePath);

            const worksheet = content.worksheets[0];
            if (!worksheet) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Excel không hợp lệ!",
                    error: USER_CONSTANTS.ERROR.EXCEL_FAIL
                }, HttpStatus.BAD_REQUEST)
            }

            let success = 0;
            let error = 0;

            const rowStartIndex = 2;
            const numberOfRows = worksheet.rowCount - 1;
            const rows = worksheet.getRows(rowStartIndex, numberOfRows) ?? [];
            let usersPromise = rows.map(async (row): Promise<IUser> => {

                if (getCellValue(row, 9).toUpperCase() !== "STUDENT" &&
                    getCellValue(row, 9).toUpperCase() !== "TEACHER"
                ) {
                    error++;
                    return undefined;
                }

                return {
                    email: row.getCell(1),
                    password: await this.authUtils.hashPassword(getCellValue(row, 2)),
                    user_id: getCellValue(row, 2),
                    user_name: getCellValue(row, 3),
                    user_phone: getCellValue(row, 4),
                    user_faculty: processFaculty(getCellValue(row, 5).toUpperCase()),
                    user_major: processMajor(getCellValue(row, 6).toUpperCase()),
                    user_date_of_birth: moment(getCellValue(row, 7), ['DD/MM/YYYY', 'YYYY/MM/DD', 'DD-MM-YYYY']).format(),
                    user_permanent_address: getCellValue(row, 8),
                    role: getCellValue(row, 9).toUpperCase(),
                    user_avatar: null,
                    user_CCCD: null,
                    user_temporary_address: null,
                    user_department: null,
                    user_status: null,
                    user_average_grade: null
                }
            });

            let users: any = await Promise.all(usersPromise);
            // Loại bỏ các giá trị undefined
            users = users.filter((user: any) => user !== undefined);

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const existedUser = await this.userModel.findOne({
                    $or: [
                        { email: user.email },
                        { user_id: user.user_id }
                    ]

                })

                if (!existedUser) {
                    //Tạo user mới
                    const newUser = await this.userModel.create(user);
                    newUser ? success++ : error++;
                } else {

                    if (existedUser.role === 'LEADER') {
                        error++;
                    }
                    else {
                        // Update user
                        delete user.password;
                        delete user.email;
                        delete user.user_id;
                        const updateUser = await this.userModel.findByIdAndUpdate(existedUser._id, user);
                        updateUser ? success++ : error++;
                    }
                }
            }

            // Xóa file sau khi sử lý
            fs.unlinkSync(filePath);

            return {
                statusCode: HttpStatus.OK,
                message: "Import excel thành công!",
                error: null,
                data: {
                    success: success,
                    error: error
                }
            }

        } catch (error) {
            throw new HttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Import excel thất bại!",
                error: error.message,
            }, HttpStatus.BAD_REQUEST)
        }

    }

    async findOne(id: string) {

        this.validateUtils.validateObjectId(id);

        const user = await this.userModel.findById(id)
            .populate("user_faculty user_major");

        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Can not get user with id: ${id}`,
                error: USER_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Get semester successfully!",
            error: null,
            data: {
                user
            }
        }
    }

    async update(id: string, updateUserDto: UpdateUserDto) {

        this.validateUtils.validateObjectId(id);

        const options = {
            new: true,
        };

        const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, options);
        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Can not update this user!",
                error: USER_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Update user successfully!",
            error: null,
            data: {
                user
            }
        }
    }

    //Admin moi co the xoa
    async remove(id: string) {

        this.validateUtils.validateObjectId(id);

        const user = await this.userModel.findByIdAndDelete(id).lean().select("-password");

        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Can not delete this user!",
                error: USER_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Delete user successfully!",
            error: null,
            data: {
                user
            }
        }
    }

    async getUsersByRole(user_role: any) {
        const { role } = user_role;

        const users = await this.userModel.find({ role })
        const total = await this.userModel.countDocuments({ role });

        return {
            statusCode: HttpStatus.OK,
            message: "Get users successfully!",
            error: null,
            data: {
                users,
                total
            }
        }

    }

    async multipleSearch(query_input: any) {

        const { query, role } = query_input;

        let filter: any = {
            $or: [
                { email: { $regex: query, $options: 'i' } },
                { user_name: { $regex: query, $options: 'i' } },
                { user_id: { $regex: query, $options: 'i' } },
            ]
        }

        if (role) {
            filter.role = role
        }

        const users = await this.userModel.find(filter);

        return {
            statusCode: HttpStatus.OK,
            message: "Get user successfully!",
            error: null,
            data: {
                users
            }
        }

    }

    async updateProfileInformation(req, updateUserDto) {

        const currentUser = req.currentUser._id;
        this.validateUtils.validateObjectId(currentUser);

        const options = {
            new: true,
        };

        const user = await this.userModel.findByIdAndUpdate(currentUser, updateUserDto, options);

        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Cập nhật thông tin người dùng thất bại!",
                error: USER_CONSTANTS.ERROR.NOT_FOUND
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật thông tin người dùng thành công!",
            error: null,
            data: {
                user
            }
        }
    }

    async updateAvatar(req, avatar: string) {

        const currentUserId = req.currentUser._id;

        this.validateUtils.validateObjectId(currentUserId);

        const options = {
            new: true,
        };

        const user = await this.userModel.findByIdAndUpdate(
            currentUserId,
            { user_avatar: avatar },
            options);

        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Cập nhật ảnh đại điện thất bại!",
                error: USER_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật ảnh đai diện thành công!",
            error: null,
            data: {
                user
            }
        }

    }

    async getTeacherToReviewTopics(req: any) {

        let filterTopic: any = req.body.filterTopic || {}
        let filterUser: any = req.body.filterUser || {}

        const users: any = await this.userModel.find({
            ...filterUser,
            role: 'TEACHER'
        })
            .populate("user_faculty user_major")
            .lean();


        const countPromises = users.map(async (user: any) => {

            //Đính kèm số lượng đề tài phản biện của giảng viên
            const countTopicsReviewer = await this.topicModel.countDocuments(
                {
                    ...filterTopic,
                    topic_reviewer: user._id
                }
            );

            //Đính kèm số lượng đề tài phản biện của giảng viên
            const countTopicsIntructor = await this.topicModel.countDocuments(
                {
                    ...filterTopic,
                    topic_instructor: user._id
                }
            );

            // Đính kèm số lượng hội đồng mà giảng viên tham gia
            const listTopicAssembly: any = await this.assemblyFunction.listAssemblyOfTeacher(user._id);


            return {
                ...user,
                totalReviewTopics: countTopicsReviewer,
                totalIntructTopics: countTopicsIntructor,
                totalAssembly: listTopicAssembly.length
            };
        });

        const usersWithReviewCounts = await Promise.all(countPromises);

        return {
            statusCode: HttpStatus.OK,
            message: "Get teacher successfully!",
            error: null,
            data: {
                users: usersWithReviewCounts,
                total: users.length,
            }
        }

    }

    // STUDENT
    async studentUploadFile(req, fileUrl: string) {

        const currentUserId = req.currentUser._id;
        const { update_field } = req.body;
        this.validateUtils.validateObjectId(currentUserId);

        const allowField = ["user_transcript"];

        if (!allowField.includes(update_field)) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Không được phép thực hiện hành động này!",
                error: USER_CONSTANTS.ERROR.ACTION_FORBIDDEN
            }, HttpStatus.BAD_REQUEST)
        }

        let updateData = {}
        updateData[update_field] = fileUrl

        const user = await this.userModel.findByIdAndUpdate(
            currentUserId,
            { user_transcript: fileUrl },
            { new: true });

        if (!user) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Cập nhật tài liệu thất bại!",
                error: USER_CONSTANTS.ERROR.UPDATE_FAIL
            }, HttpStatus.BAD_REQUEST)
        }

        return {
            statusCode: HttpStatus.OK,
            message: "Cập nhật tài liệu thành công!",
            error: null,
            data: {
                user
            }
        }

    }

}