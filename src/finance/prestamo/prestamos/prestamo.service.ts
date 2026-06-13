import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prestamo } from './entity/prestamo.entity';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Movimiento } from 'src/finance/movimiento/movimiento/entity/movimiento.entity';

@Injectable()
export class PrestamoService {
  constructor(
    @InjectRepository(Prestamo)
    private readonly prestamoRepo: Repository<Prestamo>,

    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async findAll(user: Usuario): Promise<any> {
    const whereCondition =
      user.rol?.nombre === 'admin'
        ? {}
        : { usuario: { id_usuario: user.id_usuario } };

    const prestamos = await this.prestamoRepo.find({
      where: whereCondition,
      relations: ['abonos'],
      loadEagerRelations: false,
    });

    return {
      message:
        prestamos.length === 0
          ? 'No hay préstamos registrados'
          : 'Préstamos obtenidos correctamente',
      data: prestamos,
    };
  }

  async findOne(id: number, user: Usuario): Promise<any> {
    const whereCondition =
      user.rol?.nombre === 'admin'
        ? { id_prestamo: id }
        : { id_prestamo: id, usuario: { id_usuario: user.id_usuario } };

    const prestamo = await this.prestamoRepo.findOne({
      where: whereCondition,
      relations: ['abonos'],
      loadEagerRelations: false,
    });

    if (!prestamo) {
      throw new NotFoundException('Préstamo no encontrado');
    }

    return {
      message: 'Préstamo obtenido correctamente',
      data: prestamo,
    };
  }

  async create(
    createPrestamoDto: CreatePrestamoDto,
    user: Usuario,
  ): Promise<any> {
    const isAdmin = user.rol?.nombre === 'admin';

    let idUsuarioDestino = user.id_usuario;
    if (isAdmin && createPrestamoDto.id_usuario) {
      idUsuarioDestino = createPrestamoDto.id_usuario;
    }

    const usuario = await this.usuarioRepo.findOne({
      where: { id_usuario: idUsuarioDestino },
      loadEagerRelations: false,
    });

    if (!usuario) {
      throw new NotFoundException(
        `El usuario con ID ${idUsuarioDestino} no existe.`,
      );
    }

    const newPrestamo = this.prestamoRepo.create({
      ...createPrestamoDto,
      usuario,
    });

    const savedPrestamo = await this.prestamoRepo.save(newPrestamo);
    //exluir datos del usuario en la respuesta
    const { usuario: _usuarioData, ...prestamoSinUsuario } = savedPrestamo;
    return {
      message: 'Préstamo creado correctamente',
      data: prestamoSinUsuario,
      statusCode: HttpStatus.CREATED,
    };
  }

  async update(
    id: number,
    updatePrestamoDto: UpdatePrestamoDto,
    user: Usuario,
  ): Promise<any> {
    const prestamo = await this.findOne(id, user);

    this.prestamoRepo.merge(prestamo.data, updatePrestamoDto);

    const updated = await this.prestamoRepo.save(prestamo.data);

    return {
      message: 'Préstamo actualizado correctamente',
      data: updated,
    };
  }

  async remove(id: number, user: Usuario): Promise<any> {
    const prestamo = await this.findOne(id, user);

    await this.prestamoRepo.delete(id);

    return {
      message: 'Préstamo eliminado correctamente',
      deletedId: id,
      data: prestamo.data,
    };
  }

  async getPrestamoDetails(user: Usuario): Promise<any> {
    const whereCondition =
      user.rol?.nombre === 'admin'
        ? {}
        : { usuario: { id_usuario: user.id_usuario } };

    const prestamos = await this.prestamoRepo.find({
      where: whereCondition,
      loadEagerRelations: false,
    });

    const details = prestamos.map((p) => ({
      id_prestamo: p.id_prestamo,
      prestamista: p.prestamista,
      monto_total: p.monto_total,
      monto_pagado: p.monto_pagado,
      monto_restante: Number(p.monto_total) - Number(p.monto_pagado),
      estado: p.estado,
    }));

    return {
      message: 'Detalles obtenidos correctamente',
      data: details,
    };
  }
}
