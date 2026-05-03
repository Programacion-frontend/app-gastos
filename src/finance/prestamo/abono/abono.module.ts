import { Module } from '@nestjs/common';
import { AbonoController } from './abono.controller';
import { AbonoService } from './abono.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Abono } from './entity/abono.entity';
import { Prestamo } from '../prestamos/entity/prestamo.entity';
import { Tag } from 'src/finance/tag/entity/tag.entity';
import { Categoria } from 'src/finance/categoria/entity/categoria.entity';
import { Movimiento } from 'src/finance/movimiento/movimiento/entity/movimiento.entity';

@Module({
  controllers: [AbonoController],
  providers: [AbonoService],
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Abono,
      Prestamo,
      Tag,
      Categoria,
      Movimiento,
    ]),
  ],
})
export class AbonoModule {}
