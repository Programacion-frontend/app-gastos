import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { In, IsNull, Repository } from 'typeorm';
import { Categoria } from '../../categoria/entity/categoria.entity';
import { Moneda } from '../../moneda/entity/moneda.entity';
import { Abono } from '../../prestamo/abono/entity/abono.entity';
import { Prestamo } from '../../prestamo/prestamos/entity/prestamo.entity';
import { Tag } from '../../tag/entity/tag.entity';
import { CreateMovimientoDto } from './dto/create-movimiento.dto';
import { FilterMovimientoDto } from './dto/filter-movimiento.dto';
import { UpdateMovimientoDto } from './dto/update-movimiento.dto';
import { Movimiento } from './entity/movimiento.entity';

@Injectable()
export class MovimientoService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
    @InjectRepository(Moneda)
    private readonly monedaRepo: Repository<Moneda>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
    @InjectRepository(Prestamo)
    private readonly prestamoRepo: Repository<Prestamo>,
    @InjectRepository(Abono)
    private readonly abonoRepo: Repository<Abono>,
  ) {}

  private async obtenerMovimientosFiltrados(
    user: Usuario,
    filters: FilterMovimientoDto,
    tipoCategoria?: string,
  ) {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) throw new NotFoundException('Usuario no encontrado');

    const query = this.movimientoRepo.createQueryBuilder('mov');

    query
      .leftJoinAndSelect('mov.categoria', 'cat')
      .leftJoinAndSelect('mov.moneda', 'mon')
      .leftJoinAndSelect('mov.tags', 'tag')
      .leftJoinAndSelect('mov.usuario', 'usu');

    if (currentUser.rol?.nombre !== 'admin') {
      query.andWhere('usu.id_usuario = :userId', {
        userId: currentUser.id_usuario,
      });
    }

    if (tipoCategoria) {
      query.andWhere('LOWER(cat.tipo_categoria) = LOWER(:tipo)', {
        tipo: tipoCategoria,
      });
    }
    if (filters.termino && filters.termino.trim()) {
      query.andWhere('LOWER(mov.descripcion) LIKE :termino', {
        termino: `%${filters.termino.toLowerCase()}%`,
      });
    }

    if (filters.fechaInicio) {
      query.andWhere('mov.fecha >= :inicio', { inicio: filters.fechaInicio });
    }
    if (filters.fechaFin) {
      query.andWhere('mov.fecha <= :fin', { fin: filters.fechaFin });
    }

    if (filters.tags && filters.tags.length > 0) {
      query.andWhere('tag.id_tag IN (:...tags)', { tags: filters.tags });
    }

    query.orderBy('mov.fecha', 'DESC');

    // Una lista vacía es un resultado válido (200 []), no un error 404.
    // El cliente decide cómo mostrar el estado "sin registros".
    return query.getMany();
  }

  async create(createMovimientoDto: CreateMovimientoDto, user: Usuario) {
    const { monto, fecha, descripcion, id_categoria, id_moneda, id_usuario } =
      createMovimientoDto;
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) {
      throw new NotFoundException(
        `Usuario actual con ID ${user.id_usuario} no encontrado`,
      );
    }

    let usuarioMovimiento: Usuario = currentUser;

    if (
      currentUser.rol?.nombre === 'admin' &&
      id_usuario &&
      id_usuario !== currentUser.id_usuario
    ) {
      const userToAssign = await this.usuarioRepo.findOne({
        where: { id_usuario },
      });
      if (!userToAssign) {
        throw new NotFoundException(
          `Usuario con ID ${id_usuario} no encontrado para asignar el movimiento`,
        );
      }
      usuarioMovimiento = userToAssign;
    } else if (
      currentUser.rol?.nombre !== 'admin' &&
      id_usuario &&
      id_usuario !== currentUser.id_usuario
    ) {
      throw new BadRequestException(
        'No tienes permisos para asignar movimientos a otros usuarios',
      );
    }

    const categoria = await this.categoriaRepo.findOne({
      where: { id_categoria },
    });
    if (!categoria) {
      throw new NotFoundException(
        `Categoría con ID ${id_categoria} no encontrada`,
      );
    }

    const movimiento = this.movimientoRepo.create({
      monto,
      fecha,
      descripcion,
      usuario: usuarioMovimiento,
      categoria,
    });

    if (id_moneda) {
      const moneda = await this.monedaRepo.findOne({ where: { id_moneda } });
      if (!moneda) {
        throw new NotFoundException(`Moneda con ID ${id_moneda} no encontrada`);
      }
      movimiento.moneda = moneda;
    }

    try {
      return await this.movimientoRepo.save(movimiento);
    } catch (error) {
      throw new BadRequestException(
        `Error al crear el movimiento: ${error.message}`,
      );
    }
  }

  async findAll(user: Usuario, filters: FilterMovimientoDto) {
    return this.obtenerMovimientosFiltrados(user, filters);
  }

  async findByCategoriaTipo(
    tipo: string,
    user: Usuario,
    filters: FilterMovimientoDto,
  ) {
    return this.obtenerMovimientosFiltrados(user, filters, tipo);
  }

  async findId(id: number, user: Usuario) {
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) {
      throw new NotFoundException(
        `Usuario actual con ID ${user.id_usuario} no encontrado`,
      );
    }

    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento: id },
      relations: ['usuario', 'categoria', 'moneda', 'tags'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    if (
      currentUser.rol?.nombre !== 'admin' &&
      movimiento.usuario?.id_usuario !== currentUser.id_usuario
    ) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este movimiento',
      );
    }

    return movimiento;
  }

  async findOne(id_movimiento: number) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento },
    });
    if (!movimiento) {
      throw new NotFoundException(
        `Movimiento con ID ${id_movimiento} no encontrado`,
      );
    }
    return movimiento;
  }

  async update(id: number, updateDto: UpdateMovimientoDto, user: Usuario) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento: id },
      relations: ['usuario', 'categoria', 'moneda', 'tags'],
    });

    if (!movimiento)
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });
    if (!currentUser) throw new NotFoundException('Usuario no válido');
    if (
      currentUser.rol?.nombre !== 'admin' &&
      movimiento.usuario?.id_usuario !== currentUser.id_usuario
    ) {
      throw new ForbiddenException(
        'No tienes permiso para actualizar este movimiento',
      );
    }

    if (updateDto.monto !== undefined) {
      const abonoAsociado = await this.abonoRepo.findOne({
        where: { movimiento_generado: { id_movimiento: id } },
        relations: ['prestamo'],
      });

      if (abonoAsociado) {
        const prestamo = abonoAsociado.prestamo;
        const montoAnterior = Number(movimiento.monto);
        const montoNuevo = Number(updateDto.monto);

        const diferencia = montoNuevo - montoAnterior;
        const nuevoTotalPagadoPrestamo =
          Number(prestamo.monto_pagado) + diferencia;

        if (nuevoTotalPagadoPrestamo > Number(prestamo.monto_total)) {
          throw new BadRequestException(
            `No se puede actualizar este gasto a ${montoNuevo} porque está vinculado a un préstamo y excede la deuda total.`,
          );
        }
        abonoAsociado.monto = montoNuevo;
        prestamo.monto_pagado = nuevoTotalPagadoPrestamo;

        prestamo.estado =
          Number(prestamo.monto_pagado) < Number(prestamo.monto_total)
            ? 'pendiente'
            : 'pagado';
        await this.prestamoRepo.save(prestamo);
        await this.abonoRepo.save(abonoAsociado);
      }
      movimiento.monto = updateDto.monto;
    }
    if (updateDto.fecha !== undefined)
      movimiento.fecha = new Date(updateDto.fecha);
    if (updateDto.descripcion !== undefined)
      movimiento.descripcion = updateDto.descripcion;

    if (updateDto.id_categoria !== undefined) {
      const categoria = await this.categoriaRepo.findOne({
        where: { id_categoria: updateDto.id_categoria },
      });
      if (!categoria)
        throw new NotFoundException(
          `Categoría con ID ${updateDto.id_categoria} no encontrada`,
        );
      movimiento.categoria = categoria;
    }

    if (updateDto.id_moneda !== undefined) {
      if (updateDto.id_moneda === null) {
        movimiento.moneda = null;
      } else {
        const moneda = await this.monedaRepo.findOne({
          where: { id_moneda: updateDto.id_moneda },
        });
        if (!moneda) throw new NotFoundException(`Moneda no encontrada`);
        movimiento.moneda = moneda;
      }
    }

    if (updateDto.tags !== undefined) {
      let tagsEntities: Tag[] = [];
      if (updateDto.tags && updateDto.tags.length > 0) {
        tagsEntities = await this.tagRepo.find({
          where: { id_tag: In(updateDto.tags) },
        });
        if (tagsEntities.length !== updateDto.tags.length) {
          throw new NotFoundException(
            'Uno o más tags enviados no fueron encontrados',
          );
        }
      }
      const esAbono = await this.abonoRepo.findOne({
        where: { movimiento_generado: { id_movimiento: id } },
      });

      if (esAbono) {
        const tagAbono = await this.tagRepo.findOne({
          where: [
            { nombre: 'abono', usuario: IsNull() },
            { nombre: 'abono', usuario: { id_usuario: user.id_usuario } },
          ],
        });

        if (tagAbono) {
          const yaEstaIncluido = tagsEntities.some(
            (t) => t.id_tag === tagAbono.id_tag,
          );
          if (!yaEstaIncluido) {
            tagsEntities.push(tagAbono);
          }
        }
      }
      movimiento.tags = tagsEntities;
    }

    try {
      return await this.movimientoRepo.save(movimiento);
    } catch (error) {
      throw new BadRequestException(
        `Error al actualizar el movimiento: ${error.message}`,
      );
    }
  }

  async delete(id: number, user: Usuario) {
    const movimiento = await this.movimientoRepo.findOne({
      where: { id_movimiento: id },
      relations: ['usuario'],
    });

    if (!movimiento) {
      throw new NotFoundException(`Movimiento con ID ${id} no encontrado`);
    }

    const currentUser = await this.usuarioRepo.findOne({
      where: { id_usuario: user.id_usuario },
      relations: ['rol'],
    });

    if (!currentUser) {
      throw new NotFoundException(
        `Usuario actual con ID ${user.id_usuario} no encontrado`,
      );
    }

    if (
      currentUser.rol?.nombre !== 'admin' &&
      movimiento.usuario?.id_usuario !== currentUser.id_usuario
    ) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este movimiento',
      );
    }

    await this.movimientoRepo.remove(movimiento);
    return { message: `Movimiento con ID ${id} eliminado correctamente` };
  }
}
