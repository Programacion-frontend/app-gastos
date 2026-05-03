import { IsOptional, IsString, IsDateString, IsArray, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterMovimientoDto {
@IsOptional()
  @IsString()
  // Si envían ?termino= (vacío), queremos que sea undefined, no ""
  @Transform(({ value }) => value === '' ? undefined : value) 
  termino?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined; // Si es null o vacío, retorna undefined
    if (typeof value === 'string') {
      // Si el usuario envía "?tags=" o "?tags=,,," limpiamos la basura
      const split = value.split(',')
          .map(v => v.trim())
          .filter(v => v !== '') // Elimina espacios vacíos
          .map(Number)
          .filter(n => !isNaN(n)); // Elimina lo que no sea número
      
      return split.length > 0 ? split : undefined;
    }
    return value;
  })
  @IsArray()
  tags?: number[];
}