import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario@migasto.com', description: 'Correo del usuario' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Usuario123', description: 'Contraseña' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
