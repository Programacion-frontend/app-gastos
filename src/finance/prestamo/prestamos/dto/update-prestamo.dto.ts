import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePrestamoDto {
  @IsOptional()
  @IsString()
  prestamista?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  monto_total?: number;

  @IsOptional()
  @IsDateString()
  fecha_limite?: string;

  @IsOptional()
  descripcion?: string;
}
