import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  app.setGlobalPrefix('api');

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL?.replace(/\/$/, ''),
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MiGasto API')
    .setDescription(
      'API de gestión de gastos personales (NestJS). ' +
        'Autenticación por cookie httpOnly `access_token`. ' +
        'Para probar rutas protegidas: ejecuta POST /api/auth/login y luego ' +
        'invoca el resto de endpoints (la cookie se envía automáticamente). ' +
        'Usuarios de prueba (seed): admin@migasto.com / Admin123 · ' +
        'usuario@migasto.com / Usuario123.',
    )
    .setVersion('1.0')
    .addCookieAuth('access_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'access_token',
      description: 'JWT emitido por POST /api/auth/login (cookie httpOnly).',
    })
    .addTag('Auth', 'Registro, login, logout y recuperación de contraseña')
    .addTag('Usuarios', 'Gestión de usuarios')
    .addTag('Perfiles', 'Perfiles de usuario')
    .addTag('Roles', 'Catálogo de roles')
    .addTag('Géneros', 'Catálogo de géneros')
    .addTag('Movimientos', 'Ingresos y gastos')
    .addTag('Balance', 'Balance y estadísticas financieras')
    .addTag('Estadísticas', 'Estadísticas de movimientos')
    .addTag('Categorías', 'Catálogo de categorías')
    .addTag('Monedas', 'Catálogo de monedas')
    .addTag('Tags', 'Etiquetas de movimientos')
    .addTag('Presupuestos', 'Presupuestos')
    .addTag('Préstamos', 'Préstamos')
    .addTag('Abonos', 'Abonos a préstamos')
    .addTag('Notificaciones', 'Notificaciones del usuario')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'MiGasto API Docs',
    swaggerOptions: {
      withCredentials: true,
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || process.env.SERVER_PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs on http://localhost:${port}/api/docs`);
}
bootstrap();
