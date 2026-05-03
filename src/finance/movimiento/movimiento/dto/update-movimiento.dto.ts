import {
  IsOptional,
  IsNumber,
  IsDateString,
  IsString,
  IsInt,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateMovimientoDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser un número' })
  monto?: number;

  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fecha?: string;

  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @IsOptional()
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  id_categoria?: number;

  @IsOptional()
  @IsInt({ message: 'El ID de la moneda debe ser un número entero' })
  id_moneda?: number;

  @IsOptional()
  @IsArray({ message: 'Los tags deben ser un arreglo' })
  @IsInt({ each: true, message: 'Cada ID de tag debe ser un número entero' })
  tags?: number[];

  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  id_usuario?: number;
}
