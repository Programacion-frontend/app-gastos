import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilUsuario } from './entity/perfil_usuario.entity';
import { Usuario } from '../usuario/entity/usuario.entity';
import { CreatePerfilUsuarioDto } from './dto/create-perfil-usuario.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';
import { Genero } from '../genero/entity/genero.entity';

@Injectable()
export class PerfilService {
  constructor(
    @InjectRepository(PerfilUsuario)
    private readonly perfilRepository: Repository<PerfilUsuario>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Genero)
    private readonly generoRepository: Repository<Genero>,
  ) {}

  async create(
    createPerfilDto: CreatePerfilUsuarioDto,
    user: Usuario,
  ): Promise<PerfilUsuario> {
    const perfilExistente = await this.perfilRepository.findOne({
      where: { usuario: { id_usuario: user.id_usuario } },
    });
    if (perfilExistente) {
      throw new BadRequestException('Este usuario ya tiene un perfil.');
    }

    const { id_genero, ...rest } = createPerfilDto;
    const perfil = this.perfilRepository.create({
      ...rest,
      usuario: user,
    });

    if (id_genero) {
      const genero = await this.generoRepository.findOne({
        where: { id_genero },
      });
      if (!genero) {
        throw new NotFoundException(
          `Género con ID ${id_genero} no encontrado.`,
        );
      }
      perfil.genero = genero;
    }

    return this.perfilRepository.save(perfil);
  }

  async findAll(): Promise<PerfilUsuario[]> {
    return this.perfilRepository.find({ relations: ['usuario', 'genero'] });
  }

  async findByUser(user: Usuario): Promise<PerfilUsuario> {
    const perfil = await this.perfilRepository.findOne({
      where: { usuario: { id_usuario: user.id_usuario } },
      relations: ['usuario', 'genero', 'usuario.rol'],
    });

    if (!perfil) {
      throw new NotFoundException(
        'No se encontró un perfil para este usuario.',
      );
    }

    return perfil;
  }

  async findOne(id_perfil: number, user: Usuario): Promise<PerfilUsuario> {
    const perfil = await this.perfilRepository.findOne({
      where: { id_perfil },
      relations: ['usuario', 'genero', 'usuario.rol'],
    });

    if (!perfil) {
      throw new NotFoundException(`Perfil con ID ${id_perfil} no encontrado.`);
    }

    const isOwner = perfil.usuario.id_usuario === user.id_usuario;
    const isAdmin = user.rol.nombre === 'admin';

    // Un usuario normal solo puede ver su propio perfil.
    // Un admin puede ver cualquier perfil.
    if (!isOwner && !isAdmin) {
      throw new UnauthorizedException(
        'No tienes permiso para acceder a este perfil.',
      );
    }

    return perfil;
  }

  async update(
    id_perfil: number,
    updatePerfilDto: UpdatePerfilUsuarioDto,
    user: Usuario,
  ): Promise<PerfilUsuario> {
    const perfil = await this.findOne(id_perfil, user);

    const isOwner = perfil.usuario.id_usuario === user.id_usuario;
    const isAdmin = user.rol.nombre === 'admin';

    if (!isOwner && !(isAdmin && perfil.usuario.rol.nombre === 'usuario')) {
      throw new UnauthorizedException(
        'No tienes permiso para actualizar este perfil.',
      );
    }

    const { id_genero, ...rest } = updatePerfilDto;

    if (id_genero) {
      const genero = await this.generoRepository.findOne({
        where: { id_genero },
      });
      if (!genero) {
        throw new NotFoundException(
          `Género con ID ${id_genero} no encontrado.`,
        );
      }
      perfil.genero = genero;
    }

    Object.assign(perfil, rest);
    return this.perfilRepository.save(perfil);
  }

  async updateByUser(
    updatePerfilDto: UpdatePerfilUsuarioDto,
    user: Usuario,
  ): Promise<PerfilUsuario> {
    const perfil = await this.perfilRepository.findOne({
      where: { usuario: { id_usuario: user.id_usuario } },
      relations: ['usuario', 'genero', 'usuario.rol'],
    });

    if (!perfil) {
      throw new NotFoundException(
        'No se encontró un perfil para este usuario.',
      );
    }

    const { id_genero, ...rest } = updatePerfilDto;

    if (id_genero) {
      const genero = await this.generoRepository.findOne({
        where: { id_genero },
      });
      if (!genero) {
        throw new NotFoundException(
          `Género con ID ${id_genero} no encontrado.`,
        );
      }
      perfil.genero = genero;
    }

    Object.assign(perfil, rest);

    return this.perfilRepository.save(perfil);
  }

  async remove(id_perfil: number, user: Usuario): Promise<void> {
    const perfil = await this.findOne(id_perfil, user);

    const isOwner = perfil.usuario.id_usuario === user.id_usuario;
    const isAdmin = user.rol.nombre === 'admin';

    // Un usuario solo puede eliminar su propio perfil.
    // Un admin puede eliminar cualquier perfil de un usuario normal.
    if (!isOwner && !(isAdmin && perfil.usuario.rol.nombre === 'usuario')) {
      throw new UnauthorizedException(
        'No tienes permiso para eliminar este perfil.',
      );
    }

    await this.perfilRepository.remove(perfil);
  }
}
