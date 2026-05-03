import { Module } from '@nestjs/common';
import { MonedaController } from './moneda.controller';
import { MonedaService } from './moneda.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Moneda } from './entity/moneda.entity';
import { Movimiento } from '../movimiento/movimiento/entity/movimiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Moneda, Movimiento])],
  controllers: [MonedaController],
  providers: [MonedaService],
})
export class MonedaModule {}
