import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Categoria } from 'src/finance/categoria/entity/categoria.entity';
import { CreateMovimientoDto } from 'src/finance/movimiento/movimiento/dto/create-movimiento.dto';
import { Movimiento } from 'src/finance/movimiento/movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { IsNull, Repository } from 'typeorm';
import { Tag } from '../../tag/entity/tag.entity';
import { Prestamo } from '../prestamos/entity/prestamo.entity';
import { CreateAbonoDto } from './dto/create-abono.dto';
import { UpdateAbonoDto } from './dto/update-abono.dto';
import { Abono } from './entity/abono.entity';

@Injectable()
export class AbonoService {
  constructor(
    @InjectRepository(Abono)
    private readonly abonoRepo: Repository<Abono>,

    @InjectRepository(Prestamo)
    private readonly prestamoRepo: Repository<Prestamo>,

    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,

    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,

    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
  ) {}

  async findAll(user: Usuario): Promise<any> {
    const whereCondition =
      user.rol?.nombre === 'admin'
        ? {}
        : { prestamo: { usuario: { id_usuario: user.id_usuario } } };
    const abonos = await this.abonoRepo.find({
      where: whereCondition,
      relations: ['prestamo'],
      order: { fecha_creacion: 'DESC' },
    });

    return {
      message:
        abonos.length === 0
          ? 'No hay abonos registrados'
          : 'Abonos obtenidos correctamente',
      data: abonos,
    };
  }

  async findOne(id_abono: number, user: Usuario): Promise<any> {
    const abono = await this.abonoRepo.findOne({
      where: { id_abono },
      relations: ['prestamo', 'prestamo.usuario'],
    });

    if (!abono) {
      throw new NotFoundException('Abono no encontrado');
    }

    const isAdmin = user.rol?.nombre === 'admin';

    if (!isAdmin && abono.prestamo.usuario.id_usuario !== user.id_usuario) {
      throw new NotFoundException('Abono no encontrado o sin permisos');
    }

    return {
      message: 'Abono obtenido correctamente',
      data: abono,
    };
  }

  async create(
    id_prestamo: number,
    createAbonoDto: CreateAbonoDto,
    user: Usuario,
  ): Promise<any> {
    const whereCondition =
      user.rol?.nombre === 'admin'
        ? { id_prestamo }
        : { id_prestamo, usuario: { id_usuario: user.id_usuario } };

    const prestamo = await this.prestamoRepo.findOne({
      where: whereCondition,
    });

    if (!prestamo) throw new NotFoundException('Préstamo no encontrado');

    const montoAbono = Number(createAbonoDto.monto);
    if (montoAbono <= 0)
      throw new BadRequestException('El monto debe ser positivo.');

    const montoPagado = Number(prestamo.monto_pagado);
    const montoTotal = Number(prestamo.monto_total);

    if (montoPagado + montoAbono > montoTotal) {
      throw new BadRequestException('El abono excede la deuda total.');
    }

    const newAbono = this.abonoRepo.create({ ...createAbonoDto, prestamo });
    const savedAbono = await this.abonoRepo.save(newAbono);

    prestamo.monto_pagado = montoPagado + montoAbono;
    if (prestamo.monto_pagado >= montoTotal) prestamo.estado = 'pagado';

    await this.prestamoRepo.save(prestamo);

    return {
      message: 'Abono agregado exitosamente',
      data: savedAbono,
    };
  }

  async update(
    id_abono: number,
    updateAbonoDto: UpdateAbonoDto,
    user: Usuario,
  ): Promise<any> {
    const abono = await this.abonoRepo.findOne({
      where: { id_abono },
      relations: ['prestamo', 'prestamo.usuario', 'movimiento_generado'],
    });

    if (!abono) throw new NotFoundException('Abono no encontrado');
    const isAdmin = user.rol?.nombre === 'admin';
    if (!isAdmin && abono.prestamo.usuario.id_usuario !== user.id_usuario) {
      throw new NotFoundException('No tienes permisos sobre este abono');
    }

    const prestamo = abono.prestamo;
    if (updateAbonoDto.monto) {
      const montoAnteriorAbono = Number(abono.monto);
      const montoNuevoAbono = Number(updateAbonoDto.monto);

      const diff = montoNuevoAbono - montoAnteriorAbono;
      const nuevoTotalPagado = Number(prestamo.monto_pagado) + diff;
      if (nuevoTotalPagado > Number(prestamo.monto_total)) {
        throw new BadRequestException(
          'La actualización del monto excede la deuda total del préstamo.',
        );
      }
      prestamo.monto_pagado = nuevoTotalPagado;

      abono.monto = montoNuevoAbono;
    }

    prestamo.estado =
      Number(prestamo.monto_pagado) < Number(prestamo.monto_total)
        ? 'pendiente'
        : 'pagado';

    if (abono.movimiento_generado) {
      let movimientoModificado = false;

      if (updateAbonoDto.monto) {
        abono.movimiento_generado.monto = Number(updateAbonoDto.monto);
        movimientoModificado = true;
      }

      if (movimientoModificado) {
        await this.movimientoRepo.save(abono.movimiento_generado);
      }
    }
    await this.prestamoRepo.save(prestamo);
    const updatedAbono = await this.abonoRepo.save(abono);

    return {
      message:
        'Abono actualizado correctamente' +
        (abono.movimiento_generado ? ' y gasto sincronizado.' : '.'),
      data: updatedAbono,
    };
  }

  async remove(id_abono: number, user: Usuario): Promise<any> {
    const abono = await this.abonoRepo.findOne({
      where: { id_abono },
      relations: ['prestamo', 'prestamo.usuario', 'movimiento_generado'],
    });

    if (!abono) throw new NotFoundException('Abono no encontrado');
    const isAdmin = user.rol?.nombre === 'admin';
    if (!isAdmin && abono.prestamo.usuario.id_usuario !== user.id_usuario) {
      throw new NotFoundException('No tienes permisos sobre este abono');
    }

    const prestamo = abono.prestamo;
    prestamo.monto_pagado = Number(prestamo.monto_pagado) - Number(abono.monto);
    if (Number(prestamo.monto_pagado) < Number(prestamo.monto_total)) {
      prestamo.estado = 'pendiente';
    }
    if (abono.movimiento_generado) {
      const idMovimiento = abono.movimiento_generado.id_movimiento;
      abono.movimiento_generado = undefined;
      await this.abonoRepo.save(abono);
      await this.movimientoRepo.delete(idMovimiento);
    }
    await this.prestamoRepo.save(prestamo);
    await this.abonoRepo.remove(abono);

    return {
      message:
        'Abono eliminado correctamente' +
        (abono.movimiento_generado
          ? ' (y su gasto asociado también fue borrado).'
          : '.'),
      deletedId: id_abono,
    };
  }

  async createGastoFromAbono(
    id_abono: number,
    user: Usuario,
  ): Promise<CreateMovimientoDto> {
    const abono = await this.abonoRepo.findOne({
      where: { id_abono },
      relations: ['prestamo', 'prestamo.usuario', 'movimiento_generado'],
    });

    if (!abono) throw new NotFoundException('Abono no encontrado');

    if (abono.movimiento_generado) {
      throw new BadRequestException(
        'Este abono ya tiene un gasto asociado. Debes revertirlo primero si quieres crearlo de nuevo.',
      );
    }

    const isAdmin = user.rol?.nombre === 'admin';
    if (!isAdmin && abono.prestamo.usuario.id_usuario !== user.id_usuario) {
      throw new NotFoundException('No tienes permisos sobre este abono');
    }

    const categoriaGasto = await this.categoriaRepo.findOne({
      where: { tipo_categoria: 'gasto' },
    });

    if (!categoriaGasto) {
      throw new BadRequestException(
        'No se encontró la categoría "gasto" en el sistema.',
      );
    }

    const tagAbono = await this.tagRepo.findOne({
      where: [
        { nombre: 'abono', usuario: IsNull() },
        { nombre: 'abono', usuario: { id_usuario: user.id_usuario } },
      ],
    });

    const descripcion = `Abono del prestamo de '${abono.prestamo.prestamista}'`;
    const tagsEntidades = tagAbono ? [tagAbono] : [];

    const nuevoMovimiento = this.movimientoRepo.create({
      monto: Number(abono.monto),
      fecha: new Date(),
      descripcion: descripcion,
      categoria: categoriaGasto,
      usuario: user,
      tags: tagsEntidades,
    });

    const movimientoGuardado = await this.movimientoRepo.save(nuevoMovimiento);
    abono.movimiento_generado = movimientoGuardado;
    await this.abonoRepo.save(abono);
    const respuestaFrontend: CreateMovimientoDto = {
      monto: Number(nuevoMovimiento.monto),
      fecha: new Date().toISOString().split('T')[0],
      descripcion: nuevoMovimiento.descripcion,
      id_categoria: categoriaGasto.id_categoria,
      id_usuario: user.id_usuario,
    };

    return respuestaFrontend;
  }

  async revertGastoFromAbono(id_abono: number, user: Usuario): Promise<any> {
    const abono = await this.abonoRepo.findOne({
      where: { id_abono },
      relations: ['prestamo', 'prestamo.usuario', 'movimiento_generado'],
    });

    if (!abono) throw new NotFoundException('Abono no encontrado');

    const isAdmin = user.rol?.nombre === 'admin';
    if (!isAdmin && abono.prestamo.usuario.id_usuario !== user.id_usuario) {
      throw new NotFoundException('No tienes permisos sobre este abono');
    }

    if (!abono.movimiento_generado) {
      throw new BadRequestException(
        'Este abono no tiene ningún gasto registrado para eliminar.',
      );
    }

    const idMovimientoABorrar = abono.movimiento_generado.id_movimiento;
    abono.movimiento_generado = undefined;
    await this.abonoRepo.save(abono);
    await this.movimientoRepo.delete(idMovimientoABorrar);

    return {
      message:
        'Gasto asociado eliminado correctamente. El abono ahora está libre para registrarse de nuevo.',
    };
  }
}
