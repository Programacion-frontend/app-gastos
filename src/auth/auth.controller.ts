import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUsuarioDto } from 'src/user/usuario/dto/create-usuario.dto';
import { RequestPasswordResetDto } from 'src/mail/dto/request-password-reset.dto';
import { ResetPasswordDto } from 'src/mail/dto/reset-password.dto';
import { ResendPasswordResetDto } from '../mail/dto/resend-password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async registerUser(@Body() user: CreateUsuarioDto) {
    return this.authService.registerUser(user);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
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
}
