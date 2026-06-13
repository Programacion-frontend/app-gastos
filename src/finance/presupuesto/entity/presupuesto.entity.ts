import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../../user/usuario/entity/usuario.entity';

@Entity('presupuesto')
export class Presupuesto {
  @PrimaryGeneratedColumn()
  id_presupuesto: number;

  @Column()
  mes: number;

  @Column()
  anio: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  monto_maximo: number;

  @ManyToOne(() => Usuario, (usuario) => usuario.presupuestos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
