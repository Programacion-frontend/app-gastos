import { Module } from '@nestjs/common';
import { GeneroController } from './genero.controller';
import { GeneroService } from './genero.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Genero } from './entity/genero.entity';
import { PerfilUsuario } from '../perfil/entity/perfil_usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Genero, PerfilUsuario])],
  controllers: [GeneroController],
  providers: [GeneroService],
})
export class GeneroModule {}
