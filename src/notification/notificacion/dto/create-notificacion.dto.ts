import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
} from 'class-validator';

export class CreateNotificacionDto {
  @IsNotEmpty()
  @IsString()
  mensaje: string;

  @IsNotEmpty()
  @IsEnum(['alerta_presupuesto', 'recordatorio', 'otro'])
  tipo: 'alerta_presupuesto' | 'recordatorio' | 'otro';

  @IsOptional()
  @IsEnum(['pendiente', 'leida'])
  estado?: 'pendiente' | 'leida';

  @IsNotEmpty()
  @IsInt()
  id_usuario: number;
}
