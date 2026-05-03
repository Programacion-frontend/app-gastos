import { Module } from '@nestjs/common';
import { MovimientoController } from './movimiento.controller';
import { MovimientoService } from './movimiento.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from './entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria } from '../../categoria/entity/categoria.entity';
import { Moneda } from '../../moneda/entity/moneda.entity';
import { Tag } from '../../tag/entity/tag.entity';
import { Prestamo } from '../../prestamo/prestamos/entity/prestamo.entity';
import { Abono } from '../../prestamo/abono/entity/abono.entity';
import { BalanceModule } from '../balance/balance.module';
import { EstadisticasModule } from '../estadisticas/estadisticas.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Movimiento,
      Usuario,
      Categoria,
      Moneda,
      Tag,
      Prestamo,
      Abono,
    ]),
    BalanceModule,
    EstadisticasModule,
  ],
  controllers: [MovimientoController],
  providers: [MovimientoService],
})
export class MovimientoModule {}
