import { Module } from '@nestjs/common';
import { TagController } from './tag.controller';
import { TagService } from './tag.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tag } from './entity/tag.entity';
import { Movimiento } from '../movimiento/movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria } from '../categoria/entity/categoria.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tag, Movimiento, Usuario, Categoria])],
  controllers: [TagController],
  providers: [TagService],
})
export class TagModule {}
