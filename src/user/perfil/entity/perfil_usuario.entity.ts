import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';
import { Genero } from 'src/user/genero/entity/genero.entity';

@Entity('perfil_usuario')
export class PerfilUsuario {
  @PrimaryGeneratedColumn()
  id_perfil: number;

  @Column({ length: 150, nullable: true })
  nombre_completo: string;

  @Column({ nullable: true })
  edad: string;

  @Column({ length: 255, nullable: true })
  foto_perfil: string;

  @Column({ length: 20, nullable: true })
  telefono: string;

  @OneToOne(() => Usuario, (usuario) => usuario.perfil, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @ManyToOne(() => Genero, (genero) => genero.perfiles, { nullable: true })
  @JoinColumn({ name: 'id_genero' })
  genero: Genero;
}
