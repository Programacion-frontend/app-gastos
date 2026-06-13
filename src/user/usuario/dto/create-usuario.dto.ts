import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  IsOptional,
  IsNumberString,
  IsUrl,
  Length,
} from 'class-validator';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'nuevo@migasto.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Secreto123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: 2,
    description: 'ID del rol (2 = usuario, 1 = admin)',
  })
  @IsInt()
  @IsNotEmpty()
  rolId: number;

  @ApiPropertyOptional({ example: 'Juan Pérez' })
  @IsString()
  @IsOptional()
  nombre_completo?: string;

  @ApiPropertyOptional({ example: '25' })
  @IsOptional()
  @IsNumberString()
  edad?: string;

  @ApiPropertyOptional({ example: 'https://i.pravatar.cc/150' })
  @IsOptional()
  @IsUrl()
  foto_perfil?: string;

  @ApiPropertyOptional({ example: '3001234567' })
  @IsOptional()
  s;
  @IsString()
  @Length(7, 20)
  telefono?: string;

  @ApiPropertyOptional({ example: 1, description: 'ID del género' })
  @IsOptional()
  @IsInt()
  id_genero?: number;
}
