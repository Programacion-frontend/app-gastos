import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Movimiento } from '../../movimiento/movimiento/entity/movimiento.entity';
import { on } from 'events';
import { Tag } from 'src/finance/tag/entity/tag.entity';

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn()
  id_categoria: number;

  @Column({ length: 20 })
  tipo_categoria: string;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.categoria)
  movimientos: Movimiento[];

  @OneToMany(() => Tag, (tag) => tag.categoria)
  @JoinColumn({ name: 'id_tag' })
  tags: Tag[];
}
