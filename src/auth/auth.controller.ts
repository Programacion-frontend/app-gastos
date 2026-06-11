import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { RequestPasswordResetDto } from 'src/mail/dto/request-password-reset.dto';
import { ResetPasswordDto } from 'src/mail/dto/reset-password.dto';
import { CreateUsuarioDto } from 'src/user/usuario/dto/create-usuario.dto';
import { ResendPasswordResetDto } from '../mail/dto/resend-password-reset.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Estado de sesión (protegido)',
    description:
      'Devuelve el usuario autenticado. Requiere cookie `access_token`. ' +
      'Sin login responde 401 (útil para probar el guard).',
  })
  @UseGuards(JwtAuthGuard)
  @Get('check-status')
  checkAuthStatus(@Request() req) {
    return req.user;
  }

  @ApiOperation({
    summary: 'Registrar usuario',
    description:
      'Crea el usuario y su perfil. NO inicia sesión ni emite token (el login es independiente).',
  })
  @Post('register')
  async registerUser(@Body() user: CreateUsuarioDto) {
    return this.authService.registerUser(user);
  }

  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Valida credenciales y setea la cookie httpOnly `access_token`. ' +
      'Tras ejecutarlo, los endpoints protegidos quedan accesibles desde Swagger.',
  })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    const { email, password } = loginDto;
    
    const tokenObj = await this.authService.login(email, password);


    res.cookie('access_token', tokenObj.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, 
    });

    return { message: 'Autenticación exitosa' };
  }


  @ApiOperation({ summary: 'Solicitar OTP de recuperación de contraseña' })
  @Post('request-password-reset')
  async requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @ApiOperation({ summary: 'Reenviar OTP de recuperación' })
  @Post('resend-password-reset')
  resendPasswordReset(@Body() dto: ResendPasswordResetDto) {
    return this.authService.resendPasswordResetOtp(dto.email);
  }

  @ApiOperation({ summary: 'Restablecer contraseña con OTP' })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.otp, dto.newPassword);
  }

  @ApiOperation({ summary: 'Cerrar sesión (limpia la cookie)' })
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {

    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, 
    });
    return { message: 'Sesión cerrada correctamente' };
  }
}