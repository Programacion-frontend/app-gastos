import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Movimiento } from '../movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria } from '../../categoria/entity/categoria.entity';

@Injectable()
export class EstadisticasService {
  constructor(
    @InjectRepository(Movimiento)
    private readonly movimientoRepo: Repository<Movimiento>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  async obtenerEstadisticas(
    tipo: 'ingreso' | 'gasto',
    user: Usuario,
    mes?: number,
    anio?: number,
  ) {
    try {
      const currentUser = await this.usuarioRepo.findOne({
        where: { id_usuario: user.id_usuario },
        relations: ['rol'],
      });

      if (!currentUser)
        throw new NotFoundException(
          `Usuario con ID ${user.id_usuario} no encontrado`,
        );

      const categorias = await this.categoriaRepo.find({
        where: { tipo_categoria: tipo },
      });
      if (!categorias.length)
        throw new NotFoundException(`No existen categorías tipo ${tipo}`);

      const categoriaIds = categorias.map((c) => c.id_categoria);
      const where: any = { categoria: { id_categoria: In(categoriaIds) } };

      if (currentUser.rol?.nombre !== 'admin') {
        where.usuario = { id_usuario: currentUser.id_usuario };
      }

      if (mes && anio) {
        const inicioMes = new Date(anio, mes - 1, 1);
        const finMes = new Date(anio, mes, 0);
        where.fecha = Between(inicioMes, finMes);
      } else if (anio) {
        where.fecha = Between(new Date(anio, 0, 1), new Date(anio, 11, 31));
      }

      const movimientos = await this.movimientoRepo.find({
        where,
        relations: ['categoria', 'tags'],
      });

      if (!movimientos.length) {
        let filtroTxt = '';
        if (mes && anio) filtroTxt = `en ${mes}/${anio}`;
        else if (anio) filtroTxt = `en el año ${anio}`;
        else filtroTxt = 'para las estadísticas seleccionadas';

        throw new NotFoundException(
          `No existen movimientos registrados ${filtroTxt}.`,
        );
      }

      const montos = movimientos.map((m) => Number(m.monto));
      const total = montos.reduce((a, b) => a + b, 0);
      const cantidad = movimientos.length;
      const promedio = total / cantidad;
      const max = Math.max(...montos);

      const tagMap = new Map<string, number>();
      for (const mov of movimientos) {
        if (mov.tags) {
          for (const tag of mov.tags) {
            const nombre = tag.nombre;
            tagMap.set(nombre, (tagMap.get(nombre) || 0) + Number(mov.monto));
          }
        }
      }
      const graficoTags = Array.from(tagMap.entries()).map(([tag, total]) => ({
        tag,
        total,
      }));

      const mensualMap = new Map<number, number>();
      for (const mov of movimientos) {
        const mes = new Date(mov.fecha).getMonth() + 1;
        mensualMap.set(mes, (mensualMap.get(mes) || 0) + Number(mov.monto));
      }

      const graficoMensual = Array.from(mensualMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([mes, total]) => ({ mes, total }));

      const top5 = movimientos
        .sort((a, b) => Number(b.monto) - Number(a.monto))
        .slice(0, 5)
        .map((m) => ({ descripcion: m.descripcion, monto: Number(m.monto) }));

      return {
        total,
        promedio,
        cantidad,
        max,
        graficoTags,
        graficoMensual,
        top5,
        filtrosAplicados: {
          mes: mes ?? 'Todos',
          anio: anio ?? 'Todos',
        },
      };
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener estadísticas: ${error.message}`,
      );
    }
  }
}
