import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Prestamo } from '../../prestamos/entity/prestamo.entity';
import { Movimiento } from 'src/finance/movimiento/movimiento/entity/movimiento.entity';

@Entity()
export class Abono {
  @PrimaryGeneratedColumn()
  id_abono: number;

  @ManyToOne(() => Prestamo, (prestamo) => prestamo.abonos, {
    onDelete: 'CASCADE',
  })
  prestamo: Prestamo;

  @Column('decimal', { precision: 18, scale: 2 })
  monto: number;

  @OneToOne(() => Movimiento, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_movimiento_generado' })
  movimiento_generado?: Movimiento;

  @CreateDateColumn()
  fecha_creacion: Date;
}
