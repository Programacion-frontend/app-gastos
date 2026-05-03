import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Abono } from '../../abono/entity/abono.entity';

@Entity()
export class Prestamo {
  @PrimaryGeneratedColumn()
  id_prestamo: number;

  @ManyToOne(() => Usuario, { eager: true,  onDelete: 'CASCADE' })
  usuario: Usuario;

  @Column({ length: 200 })
  prestamista: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_total: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  monto_pagado: number;

  @Column({ type: 'date', nullable: true })
  fecha_limite: Date;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ length: 20, default: 'pendiente' })
  estado: 'pendiente' | 'pagado';

  @OneToMany(() => Abono, (abono) => abono.prestamo, { cascade: true })
  abonos: Abono[];

  @CreateDateColumn()
  fecha_creacion: Date;
}
