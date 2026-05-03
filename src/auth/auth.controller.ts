import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from 'src/user/usuario/dto/create-usuario.dto';
import { RequestPasswordResetDto } from 'src/mail/dto/request-password-reset.dto';
import { ResetPasswordDto } from 'src/mail/dto/reset-password.dto';
import { ResendPasswordResetDto } from '../mail/dto/resend-password-reset.dto';
import type { Response } from 'express';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @UseGuards(JwtAuthGuard) // Asumiendo que usas un Guard de JWT
  @Get('check-status')
  checkAuthStatus(@Request() req) {
    // Si el Guard deja pasar la petición, significa que la cookie es válida
    return req.user; // Devuelve los datos del usuario extraídos del token
  }

  
  @Post('register')
  async registerUser(@Body() user: CreateUsuarioDto) {
    return this.authService.registerUser(user);
  }

  @Post('login')
  async login(
    @Body() loginDto: LoginDto, 
    @Res({ passthrough: true }) res: Response
  ) {
    const { email, password } = loginDto;
    
    const tokenObj = await this.authService.login(email, password);


    res.cookie('access_token', tokenObj.access_token, {
      httpOnly: true, // El frontend no puede leerla con JS (protege contra XSS)
      secure: false, // Poner en 'true' si usas HTTPS en producción
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // Expira en 1 día
    });

    return { message: 'Autenticación exitosa' };
  }


  @Post('request-password-reset')
  async requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto.email);
  }

  @Post('resend-password-reset')
  resendPasswordReset(@Body() dto: ResendPasswordResetDto) {
    return this.authService.resendPasswordResetOtp(dto.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.otp, dto.newPassword);
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {

    res.clearCookie('access_token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: false, // true en producción con HTTPS
    });
    return { message: 'Sesión cerrada correctamente' };
  }
}
