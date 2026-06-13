import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMovimientoDto {
  @ApiProperty({ example: 150000, description: 'Monto del movimiento' })
  @IsNotEmpty({ message: 'El monto es obligatorio' })
  @Type(() => Number)
  @IsNumber({}, { message: 'El monto debe ser un número' })
  monto: number;

  @ApiProperty({ example: '2026-06-09', description: 'Fecha (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @IsDateString({}, { message: 'La fecha debe ser una fecha válida' })
  fecha: string;

  @ApiPropertyOptional({ example: 'Mercado del mes' })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto' })
  descripcion?: string;

  @ApiProperty({
    example: 2,
    description: 'ID de la categoría (ingreso/gasto)',
  })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  @IsInt({ message: 'El ID de la categoría debe ser un número entero' })
  id_categoria: number;

  @ApiPropertyOptional({ example: 1, description: 'ID de la moneda' })
  @IsOptional()
  @IsInt({ message: 'El ID de la moneda debe ser un número entero' })
  id_moneda?: number;

  @ApiPropertyOptional({
    example: 2,
    description: 'Solo admin: asignar el movimiento a otro usuario',
  })
  @IsOptional()
  @IsInt({ message: 'El ID de usuario debe ser un número entero' })
  id_usuario?: number;
}
