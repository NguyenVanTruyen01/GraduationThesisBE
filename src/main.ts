import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe(
      {
          whitelist: true,
          forbidNonWhitelisted: true, // Báo lỗi khi input có thuộc tính không được khai báo
      }
  ));

  app.enableCors(
      {
        "origin": process.env.ORIGIN,
        "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        "preflightContinue": false,
        "optionsSuccessStatus": 204
      }
  );

  await app.listen(5000);
  console.log("Server listening on port 5000...");
}
bootstrap();
