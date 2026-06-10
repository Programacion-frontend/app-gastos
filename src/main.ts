import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Necesario para que req.cookies esté disponible (JWT desde cookie HttpOnly)
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Aplica @Exclude() de las entidades en TODAS las respuestas.
  // Evita que password, passwordResetOTP, etc. salgan por la API
  // (incluyendo relaciones anidadas como api/rol -> users).
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api');

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:4200'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = process.env.SERVER_PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/api`);
}
bootstrap();
