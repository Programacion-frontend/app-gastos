import { Module } from '@nestjs/common';
import { EstadisticasController } from './estadisticas.controller';
import { EstadisticasService } from './estadisticas.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from '../movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria } from 'src/finance/categoria/entity/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, Usuario, Categoria])],
  controllers: [EstadisticasController],
  providers: [EstadisticasService]
})
export class EstadisticasModule {}
