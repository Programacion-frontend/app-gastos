import { IsNotEmpty, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAbonoDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  monto: number;
}
