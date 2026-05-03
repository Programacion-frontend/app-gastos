import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendPasswordResetDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
