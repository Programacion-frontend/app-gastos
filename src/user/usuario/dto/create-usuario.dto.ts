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
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  @IsNotEmpty()
  rolId: number;

  @IsString()
  @IsOptional()
  nombre_completo?: string;

  @IsOptional()
  @IsNumberString()
  edad?: string;

  @IsOptional()
  @IsUrl()
  foto_perfil?: string;

  @IsOptional() s;
  @IsString()
  @Length(7, 20)
  telefono?: string;

  @IsOptional()
  @IsInt()
  id_genero?: number;
}
