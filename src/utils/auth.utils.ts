import * as bcrypt from "bcryptjs";
import {Injectable} from "@nestjs/common";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthUtils {
    async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async createAccessToken(payload: any) {
        return jwt.sign(payload,
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_TIME});
    }

    comparePassword(passUser, passDB) {
        const isMatch = bcrypt.compare(passUser, passDB);
        return isMatch
    }

}

