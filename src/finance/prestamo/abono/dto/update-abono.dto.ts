import { PartialType } from '@nestjs/mapped-types';
import { CreateAbonoDto } from './create-abono.dto';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class UpdateAbonoDto extends PartialType(CreateAbonoDto) {
  // Nos aseguramos de que si envían el monto, sea válido
  @IsOptional()
  @IsNumber()
  @IsPositive()
  monto?: number;
}
