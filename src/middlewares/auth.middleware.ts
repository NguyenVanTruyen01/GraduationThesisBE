
import { Request, Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import { JwtPayload } from 'jsonwebtoken';
import { HttpException, HttpStatus, Injectable, NestMiddleware, Req, Res } from "@nestjs/common";
import { AUTH_CONSTANTS } from "./constants/auth.constant"

@Injectable()
export class AuthMiddleware implements NestMiddleware {

    private currentUser: any;

    use(req: Request, res: Response, next: NextFunction) {

        const secret = process.env.JWT_SECRET;
        const accessToken = req.headers.authorization;

        if (accessToken) {
            jwt.verify(accessToken, secret, (error, decoded) => {
                if (error) {
                    throw new HttpException({
                        statusCode: HttpStatus.FORBIDDEN,
                        message: "Your session has timed-out, Please login again!",
                        error: AUTH_CONSTANTS.ERROR.MISSING_AUTHENTICATION
                    }, HttpStatus.FORBIDDEN)
                }

                this.currentUser = decoded as JwtPayload

                req['currentUser'] = this.currentUser;

                next()
            });
        }
        else {
            throw new HttpException({
                statusCode: HttpStatus.FORBIDDEN,
                message: "You are not authenticated!",
                error: AUTH_CONSTANTS.ERROR.MISSING_AUTHENTICATION
            }, HttpStatus.FORBIDDEN)
        }
    }
}
