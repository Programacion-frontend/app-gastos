import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  Length,
  IsNumber,
  IsPositive,
} from 'class-validator';

export class CreateMonedaDto {
  @IsString({ message: 'El código debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El código no puede estar vacío' })
  @Length(1, 10, { message: 'El código debe tener entre 1 y 10 caracteres' })
  codigo: string;

  @IsString({ message: 'El símbolo debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El símbolo no puede estar vacío' })
  @Length(1, 5, { message: 'El símbolo debe tener entre 1 y 5 caracteres' })
  simbolo: string;

  @IsNumber({}, { message: 'La tasa de cambio debe ser un número' })
  @Type(() => Number)
  @IsPositive({ message: 'La tasa de cambio debe ser un número positivo' })
  tasa_cambio: number;
}
