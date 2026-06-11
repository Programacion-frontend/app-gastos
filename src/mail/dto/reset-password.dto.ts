import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: '123456', description: 'Código OTP de 6 dígitos' })
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @ApiProperty({ example: 'NuevaClave123', minLength: 6 })
  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
