// notificacion.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Usuario } from '../../../user/usuario/entity/usuario.entity';

@Entity('notificacion')
export class Notificacion {
  @PrimaryGeneratedColumn()
  id_notificacion: number;

  @Column({ length: 255 })
  mensaje: string;

  @Column({
    type: 'enum',
    enum: ['alerta_presupuesto', 'recordatorio', 'otro'],
  })
  tipo: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  fecha_creacion: Date;

  @Column({ type: 'enum', enum: ['pendiente', 'leida'], default: 'pendiente' })
  estado: string;

  @ManyToOne(() => Usuario, (usuario) => usuario.notificaciones)
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;
}
