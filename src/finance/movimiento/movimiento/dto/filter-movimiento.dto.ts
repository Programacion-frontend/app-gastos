import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class FilterMovimientoDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  termino?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      const split = value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v !== '')
        .map(Number)
        .filter((n) => !isNaN(n));

      return split.length > 0 ? split : undefined;
    }
    return value;
  })
  @IsArray()
  tags?: number[];
}
