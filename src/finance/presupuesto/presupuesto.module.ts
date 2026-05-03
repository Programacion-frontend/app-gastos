import { Module } from '@nestjs/common';
import { PresupuestoController } from './presupuesto.controller';
import { PresupuestoService } from './presupuesto.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Presupuesto } from './entity/presupuesto.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Presupuesto, Usuario])],
  controllers: [PresupuestoController],
  providers: [PresupuestoService],
})
export class PresupuestoModule {}
