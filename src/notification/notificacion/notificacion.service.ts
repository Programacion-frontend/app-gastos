import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notificacion } from './entity/notificacion.entity';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { UpdateNotificacionDto } from './dto/update-notificacion.dto';
import { Usuario } from '../../user/usuario/entity/usuario.entity';

@Injectable()
export class NotificacionService {
  constructor(
    @InjectRepository(Notificacion)
    private readonly notificacionRepository: Repository<Notificacion>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(dto: CreateNotificacionDto): Promise<Notificacion> {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: dto.id_usuario },
    });
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con id ${dto.id_usuario} no encontrado`,
      );
    }
    const notificacion = this.notificacionRepository.create({
      ...dto,
      usuario,
    });
    return await this.notificacionRepository.save(notificacion);
  }

  async findAll(): Promise<Notificacion[]> {
    return await this.notificacionRepository.find({
      relations: ['usuario'],
      order: { fecha_creacion: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Notificacion> {
    const notificacion = await this.notificacionRepository.findOne({
      where: { id_notificacion: id },
      relations: ['usuario'],
    });
    if (!notificacion) {
      throw new NotFoundException(`Notificación con id ${id} no encontrada`);
    }
    return notificacion;
  }

  async update(id: number, dto: UpdateNotificacionDto): Promise<Notificacion> {
    const notificacion = await this.findOne(id);
    if (dto.id_usuario) {
      const usuario = await this.usuarioRepository.findOne({
        where: { id_usuario: dto.id_usuario },
      });
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con id ${dto.id_usuario} no encontrado`,
        );
      }
      notificacion.usuario = usuario;
    }
    Object.assign(notificacion, dto);
    return await this.notificacionRepository.save(notificacion);
  }

  async remove(id: number): Promise<void> {
    const result = await this.notificacionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Notificación con id ${id} no encontrada`);
    }
  }
}
