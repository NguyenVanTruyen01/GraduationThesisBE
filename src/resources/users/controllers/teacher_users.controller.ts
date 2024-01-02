import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseInterceptors, UploadedFile, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from "express";
import { UsersService } from '../users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConfig } from 'src/helpers/config';
import { extname } from 'path';
import { USER_CONSTANTS } from '../constant/users.constant';

@Controller('users/teacher')
export class TeacherUsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('findAll')
  async findAll() {
    return await this.usersService.findAll();
  }

  @Post('search')
  async getUsersByRole(@Body() user_role: any) {
    return await this.usersService.getUsersByRole(user_role);
  }

  @Get('multipleSearch')
  async multipleSearch(@Query() query_input: any) {
    return await this.usersService.multipleSearch(query_input);
  }

  @Get('findById/:id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @Patch('updateProfileInformation')
  async updateProfileInformation(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto
  ) {
    try {
      return await this.usersService.updateProfileInformation(req, updateUserDto);
    } catch (err) {

      if (Object.keys(err.keyValue).includes('email')) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Email đã được sử dụng!",
          error: USER_CONSTANTS.ERROR.DUPLICATE_EMAIL
        }, HttpStatus.BAD_REQUEST)
      }
      else if (Object.keys(err.keyValue).includes('user_id')) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Mã người dùng đã được sử dụng!",
          error: USER_CONSTANTS.ERROR.DUPLICATE_EMAIL
        }, HttpStatus.BAD_REQUEST)
      }
      else if (Object.keys(err.keyValue).includes('user_CCCD')) {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "CCCD đã được sử dụng!",
          error: USER_CONSTANTS.ERROR.DUPLICATE_CCCD
        }, HttpStatus.BAD_REQUEST)
      }
      else {
        throw new HttpException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Cập nhật thất bại!",
          error: USER_CONSTANTS.ERROR.UPDATE_FAIL
        }, HttpStatus.BAD_REQUEST)
      }

    }
  }

  @Post('updateAvatar')
  @UseInterceptors(FileInterceptor(
    'avatar',
    {
      storage: storageConfig('avatar'),
      fileFilter: (req, file, callback) => {
        const ext = extname(file.originalname);
        const allowExtArr = ['.jpg', '.png', 'jpeg'];
        if (!allowExtArr.includes(ext)) {
          req.fileValidationError = `Phần mở rộng của ảnh sai. Chỉ chấp nhận file ${allowExtArr.toString()}`
          callback(null, false)
        } else {
          const fileSize = parseInt(req.headers['content-length']);
          if (fileSize > 1024 * 1024 * 5) { // Lớn hơn 5Mbs
            req.fileValidationError = `Kích thước file quá lớn. Chỉ chấp nhận file có kích thước nhỏ hơn 5Mbs `
            callback(null, false)
          } else {
            callback(null, true)
          }
        }
      }
    }
  ))
  async updateAvatar(@Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {

    if (req.fileValidationError) {
      throw new BadRequestException(req.fileValidationError)
    }
    if (!file) {
      throw new BadRequestException(`Vui lòng chọn file ảnh để cập nhật!`)
    }

    let avatarUrl: string = file.fieldname + '/' + file.filename;
    return await this.usersService.updateAvatar(req, avatarUrl);
  }

}
