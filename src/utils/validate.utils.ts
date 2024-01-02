import {Types} from "mongoose";
import {HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {extname} from "path";

@Injectable()
export class ValidateUtils {

    validateObjectId(id: string): void {
        const validObjectId = Types.ObjectId.isValid(id);

        if (!validObjectId) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Invalid ID: ${id}!`,
                error: "Bad request!"
            }, HttpStatus.BAD_REQUEST);
        }
    }

    validateImageFileType(req, file, callback) {
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
            }
            else{
                callback(null, true)
            }
        }
    }


}

