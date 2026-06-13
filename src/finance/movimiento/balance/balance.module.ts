import { Module } from '@nestjs/common';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movimiento } from '../movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Movimiento, Usuario])],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
