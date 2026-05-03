import { Module } from '@nestjs/common';
import { NotificacionController } from './notificacion.controller';
import { NotificacionService } from './notificacion.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notificacion } from './entity/notificacion.entity';
import { Usuario } from '../../user/usuario/entity/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Notificacion, Usuario])],
  controllers: [NotificacionController],
  providers: [NotificacionService],
})
export class NotificacionModule {}
