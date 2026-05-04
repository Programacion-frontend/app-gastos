import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString
} from 'class-validator';

export class CreateMovimientoDto {
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser un número' })
  monto: number;

  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fecha: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  id_categoria: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la moneda debe ser un número entero' })
  id_moneda?: number;

  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  id_usuario?: number;
}
