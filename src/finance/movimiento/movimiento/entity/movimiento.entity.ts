import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';
import { Usuario } from '../../../../user/usuario/entity/usuario.entity';
import { Categoria } from '../../../categoria/entity/categoria.entity';
import { Moneda } from '../../../moneda/entity/moneda.entity';
import { Tag } from 'src/finance/tag/entity/tag.entity';
import { Abono } from 'src/finance/prestamo/abono/entity/abono.entity';

@Entity('movimiento')
export class Movimiento {
  @PrimaryGeneratedColumn()
  id_movimiento: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ length: 255, nullable: true })
  descripcion?: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.movimientos, { eager: false,  onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Categoria, (categoria) => categoria.movimientos, {
    eager: false,
  })
  @JoinColumn({ name: 'id_categoria' })
  categoria: Categoria;

  @ManyToOne(() => Moneda, (moneda) => moneda.movimientos, { nullable: true })
  @JoinColumn({ name: 'id_moneda' })
  moneda?: Moneda | null;

  @ManyToMany(() => Tag, (tag) => tag.movimientos)
  @JoinTable({
    name: 'movimiento_tag',
    joinColumn: { name: 'id_movimiento' },
    inverseJoinColumn: { name: 'id_tag' },
  })
  tags?: Tag[];

  //relacion con abono (uno a uno)
  @OneToOne(() => Abono, (abono) => abono.movimiento_generado)
  abono?: Abono;
}
