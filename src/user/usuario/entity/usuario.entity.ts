import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Rol } from '../../rol/entity/rol.entity';
import { PerfilUsuario } from '../../perfil/entity/perfil_usuario.entity';
import { Movimiento } from '../../../finance/movimiento/movimiento/entity/movimiento.entity';
import { Presupuesto } from '../../../finance/presupuesto/entity/presupuesto.entity';
import { Notificacion } from '../../../notification/notificacion/entity/notificacion.entity';
import { Tag } from 'src/finance/tag/entity/tag.entity';
import { Prestamo } from 'src/finance/prestamo/prestamos/entity/prestamo.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn()
  id_usuario: number;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  @Column({ type: 'varchar', nullable: true })
  @Exclude()
  passwordResetOTP: string | null;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  passwordResetExpires: Date | null;

  @Column({ default: 0 })
  @Exclude()
  passwordResetAttempts: number;

  @ManyToOne(() => Rol, (rol) => rol.users)
  @JoinColumn({ name: 'rolId' })
  rol: Rol;

  @OneToOne(() => PerfilUsuario, (perfil) => perfil.usuario, { cascade: true })
  perfil: PerfilUsuario;

  @OneToMany(() => Movimiento, (movimiento) => movimiento.usuario)
  movimientos: Movimiento[];

  @OneToMany(() => Presupuesto, (presupuesto) => presupuesto.usuario)
  presupuestos: Presupuesto[];

  @OneToMany(() => Notificacion, (notificacion) => notificacion.usuario)
  notificaciones: Notificacion[];

  @OneToMany(() => Tag, (tag) => tag.usuario)
  tags: Tag[];
  @OneToMany(() => Prestamo, (prestamo) => prestamo.usuario)
  prestamos: Prestamo[];
}
