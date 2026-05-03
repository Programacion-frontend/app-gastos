import {
  IsString,
  IsInt,
  IsUrl,
  IsOptional,
  Length,
  IsNotEmpty,
  IsNumberString,
} from 'class-validator';

export class CreatePerfilUsuarioDto {
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @IsString({ message: 'El nombre completo debe ser un texto' })
  @Length(3, 150, {
    message: 'El nombre completo debe tener entre 3 y 150 caracteres',
  })
  nombre_completo: string;

  @IsOptional()
  @IsNumberString(
    {},
    { message: 'La edad debe ser un número en formato de texto' },
  )
  edad?: string;

  @IsOptional()
  @IsUrl({}, { message: 'La foto de perfil debe ser una URL válida' })
  foto_perfil?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un texto' })
  @Length(7, 20, { message: 'El teléfono debe tener entre 7 y 20 caracteres' })
  telefono?: string;

  @IsOptional()
  @IsInt({ message: 'El ID de género debe ser un número entero' })
  id_genero?: number;
}
