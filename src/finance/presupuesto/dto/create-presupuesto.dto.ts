import { IsNotEmpty, IsInt, IsNumber, IsOptional } from 'class-validator';

export class CreatePresupuestoDto {
  @IsNotEmpty()
  @IsInt()
  mes: number;

  @IsNotEmpty()
  @IsInt()
  anio: number;

  @IsNotEmpty()
  @IsNumber()
  monto_maximo: number;

  @IsNotEmpty()
  @IsOptional()
  @IsInt()
  id_usuario?: number;
}
