import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrestamoDto {
  @IsNotEmpty()
  @IsString()
  prestamista: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  monto_total: number;

  @IsOptional()
  @IsDateString()
  fecha_limite?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  id_usuario?: number;
}
