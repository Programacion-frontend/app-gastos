import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Rol } from 'src/user/rol/entity/rol.entity';
import { PerfilUsuario } from 'src/user/perfil/entity/perfil_usuario.entity';
import { MailModule } from '../mail/mail.module';
import { Genero } from 'src/user/genero/entity/genero.entity';

@Module({
  imports: [
    PassportModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_SECRET') ||
          'fallback_secret_key_123456789',
        signOptions: { expiresIn: '30m' },
      }),
    }),
    TypeOrmModule.forFeature([Usuario, Rol, PerfilUsuario, Genero]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
