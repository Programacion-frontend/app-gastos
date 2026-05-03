import { IsOptional, IsEmail, IsInt } from 'class-validator';

export class FilterUsuarioDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  id_rol?: number;
}
