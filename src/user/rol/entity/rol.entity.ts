import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Usuario } from '../../usuario/entity/usuario.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  nombre: string;

  @OneToMany(() => Usuario, (users) => users.rol)
  users: Usuario[];
}
