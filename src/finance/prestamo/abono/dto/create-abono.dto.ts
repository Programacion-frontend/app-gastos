import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAbonoDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  monto: number;
}
