import { Categoria } from 'src/finance/categoria/entity/categoria.entity';
import { Movimiento } from 'src/finance/movimiento/movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('tag')
export class Tag {
  @PrimaryGeneratedColumn()
  id_tag: number;

  @Column({ length: 50 })
  nombre: string;

  @ManyToMany(() => Movimiento, (movimiento) => movimiento.tags)
  movimientos: Movimiento[];

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Categoria, (categoria) => categoria.tags)
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;
}
