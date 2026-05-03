import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Movimiento } from '../../movimiento/movimiento/entity/movimiento.entity';

@Entity('moneda')
export class Moneda {
  @PrimaryGeneratedColumn()
  id_moneda: number;

  @Column({ length: 10 })
  codigo: string;

  @Column({ length: 5 })
  simbolo: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, default: 1.0 })
  tasa_cambio: number;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.moneda)
  movimientos: Movimiento[];
}
