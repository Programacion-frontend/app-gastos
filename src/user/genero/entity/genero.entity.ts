import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PerfilUsuario } from '../../perfil/entity/perfil_usuario.entity';

@Entity('genero')
export class Genero {
  @PrimaryGeneratedColumn()
  id_genero: number;

  @Column({ length: 50, unique: true })
  nombre: string;

  @OneToMany(() => PerfilUsuario, (perfil) => perfil.genero)
  perfiles: PerfilUsuario[];
}
