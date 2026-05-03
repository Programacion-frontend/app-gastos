import { Module } from '@nestjs/common';
import { CategoriaController } from './categoria.controller';
import { CategoriaService } from './categoria.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entity/categoria.entity';
import { Movimiento } from '../movimiento/movimiento/entity/movimiento.entity';
import { Tag } from '../tag/entity/tag.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Categoria, Movimiento, Tag])],
  controllers: [CategoriaController],
  providers: [CategoriaService],
})
export class CategoriaModule {}
