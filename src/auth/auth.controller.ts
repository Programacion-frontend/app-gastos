import { Body, Controller, Get, Post, Request, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { RequestPasswordResetDto } from 'src/mail/dto/request-password-reset.dto';
import { ResetPasswordDto } from 'src/mail/dto/reset-password.dto';
import { CreateUsuarioDto } from 'src/user/usuario/dto/create-usuario.dto';
import { ResendPasswordResetDto } from '../mail/dto/resend-password-reset.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}


  @UseGuards(JwtAuthGuard)
  @Get('check-status')
  checkAuthStatus(@Request() req) {
    return req.user;
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
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, 
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
      secure: false, 
    });
    return { message: 'Sesión cerrada correctamente' };
  }
}