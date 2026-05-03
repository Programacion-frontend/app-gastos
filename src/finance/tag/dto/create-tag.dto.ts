import {
  IsNotEmpty,
  IsString,
  MaxLength,
  Matches,
  IsInt,
} from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty({ message: 'El nombre del tag es obligatorio.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(30, { message: 'El nombre no puede tener más de 30 caracteres.' })
  nombre: string;

  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero.' })
  id_categoria: number;
}
