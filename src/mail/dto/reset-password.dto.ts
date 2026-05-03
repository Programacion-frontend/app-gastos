import { IsNotEmpty, IsString, Length, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  otp: string;

  @MinLength(6)
  @IsNotEmpty()
  newPassword: string;
}
