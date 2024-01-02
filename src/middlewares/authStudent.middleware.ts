import { Request, Response, NextFunction } from 'express';
import * as jwt from "jsonwebtoken";
import { JwtPayload } from 'jsonwebtoken';
import {HttpException, HttpStatus, Injectable,NestMiddleware} from "@nestjs/common";
import {AUTH_CONSTANTS} from "./constants/auth.constant"

@Injectable()
export class AuthStudentMiddleware implements NestMiddleware {

    private currentUser: any;

    use(req: Request, res: Response, next: NextFunction) {

        const secret = process.env.JWT_SECRET;
        const accessToken = req.headers.authorization;

        if (accessToken) {
            jwt.verify(accessToken, secret, (error, decoded)=>{
                if (typeof decoded === 'string') {
                    throw new HttpException(
                        {
                            statusCode: HttpStatus.FORBIDDEN,
                            message: 'Invalid access token!',
                            error: AUTH_CONSTANTS.ERROR.MISSING_AUTHENTICATION
                        },
                        HttpStatus.FORBIDDEN
                    );
                }

                this.currentUser = decoded as JwtPayload

                if(this.currentUser.role !== 'STUDENT'){
                    throw new HttpException({
                        statusCode: HttpStatus.FORBIDDEN,
                        message: "Action forbidden!",
                        error: AUTH_CONSTANTS.ERROR.MISSING_AUTHENTICATION
                    }, HttpStatus.FORBIDDEN)
                }

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
