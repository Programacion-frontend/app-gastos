import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateCategoriaDto {
  @IsString({ message: 'El tipo de categoría debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tipo de categoría no puede estar vacío' })
  @Length(1, 20, {
    message: 'El tipo de categoría debe tener entre 1 y 20 caracteres',
  })
  tipo_categoria: string;
}
