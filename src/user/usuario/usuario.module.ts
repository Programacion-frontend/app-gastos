import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entity/usuario.entity';
import { Rol } from '../rol/entity/rol.entity';
import { PerfilUsuario } from '../perfil/entity/perfil_usuario.entity';
import { Movimiento } from 'src/finance/movimiento/movimiento/entity/movimiento.entity';
import { Presupuesto } from 'src/finance/presupuesto/entity/presupuesto.entity';
import { Notificacion } from 'src/notification/notificacion/entity/notificacion.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Usuario,
      Rol,
      PerfilUsuario,
      Movimiento,
      Presupuesto,
      Notificacion,
    ]),
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
})
export class UsuarioModule {}
