import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({ example: 'usuario@migasto.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
