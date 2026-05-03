import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @IsNotEmpty({ message: 'El nombre del tag es obligatorio.' })
  @IsString({ message: 'El nombre debe ser una cadena de texto.' })
  @MaxLength(30, { message: 'El nombre no puede tener más de 30 caracteres.' })
  nombre: string;

  @IsNotEmpty({ message: 'La categoría es obligatoria.' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero.' })
  id_categoria: number;
}
