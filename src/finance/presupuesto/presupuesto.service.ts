import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Presupuesto } from './entity/presupuesto.entity';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { Usuario } from '../../user/usuario/entity/usuario.entity';

@Injectable()
export class PresupuestoService {
  constructor(
    @InjectRepository(Presupuesto)
    private readonly presupuestoRepository: Repository<Presupuesto>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(createPresupuestoDto: CreatePresupuestoDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { id_usuario: createPresupuestoDto.id_usuario },
    });

    if (!usuario) {
      throw new NotFoundException(
        `Usuario con id ${createPresupuestoDto.id_usuario} no encontrado`,
      );
    }

    const presupuesto = this.presupuestoRepository.create({
      mes: createPresupuestoDto.mes,
      anio: createPresupuestoDto.anio,
      monto_maximo: createPresupuestoDto.monto_maximo,
      usuario,
    });

    await this.presupuestoRepository.save(presupuesto);
    return { message: 'Presupuesto creado', data: presupuesto };
  }

  async findAll() {
    const presupuestos = await this.presupuestoRepository.find({
      relations: ['usuario'],
    });
    return { message: 'Lista de presupuestos', data: presupuestos };
  }

  async findOne(id: number) {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id_presupuesto: id },
      relations: ['usuario'],
    });
    if (!presupuesto)
      throw new NotFoundException(`Presupuesto con id ${id} no encontrado`);
    return presupuesto;
  }

  async update(id: number, updatePresupuestoDto: UpdatePresupuestoDto) {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id_presupuesto: id },
      relations: ['usuario'],
    });
    if (!presupuesto)
      throw new NotFoundException(`Presupuesto con id ${id} no encontrado`);

    if (updatePresupuestoDto.id_usuario) {
      const usuario = await this.usuarioRepository.findOne({
        where: { id_usuario: updatePresupuestoDto.id_usuario },
      });
      if (!usuario) {
        throw new NotFoundException(
          `Usuario con id ${updatePresupuestoDto.id_usuario} no encontrado`,
        );
      }
      presupuesto.usuario = usuario;
    }

    Object.assign(presupuesto, updatePresupuestoDto);
    await this.presupuestoRepository.save(presupuesto);

    return { message: 'Presupuesto actualizado', data: presupuesto };
  }

  async remove(id: number) {
    const presupuesto = await this.presupuestoRepository.findOne({
      where: { id_presupuesto: id },
    });
    if (!presupuesto)
      throw new NotFoundException(`Presupuesto con id ${id} no encontrado`);

    await this.presupuestoRepository.remove(presupuesto);
    return { message: 'Presupuesto eliminado' };
  }
}
