import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entity/categoria.entity';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Injectable()
export class CategoriaService {
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  async create(createCategoriaDto: CreateCategoriaDto): Promise<Categoria> {
    try {
      const categoria = this.categoriaRepository.create(createCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch {
      throw new InternalServerErrorException('Error al crear la categoría');
    }
  }

  async findAll(): Promise<Categoria[]> {
    try {
      return await this.categoriaRepository.find();
    } catch {
      throw new InternalServerErrorException('Error al obtener las categorías');
    }
  }

  async findOne(id: number): Promise<Categoria> {
    try {
      const categoria = await this.categoriaRepository.findOne({
        where: { id_categoria: id },
      });
      if (!categoria) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
      return categoria;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la categoría');
    }
  }

  async findWithMovimientosByUser(
    id: number,
    user: Usuario,
  ): Promise<Categoria> {
    const categoria = await this.categoriaRepository.findOne({
      where: { id_categoria: id },
      relations: ['movimientos', 'movimientos.usuario'],
    });

    if (!categoria) {
      throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
    }

    // Si el usuario no es admin, filtra sus propios movimientos
    if (user.rol.nombre !== 'admin') {
      categoria.movimientos = categoria.movimientos.filter(
        (m) => m.usuario.id_usuario === user.id_usuario,
      );
    }

    if (!categoria.movimientos || categoria.movimientos.length === 0) {
      throw new NotFoundException(
        `No existen movimientos asociados a la categoría con ID ${id}`,
      );
    }

    return categoria;
  }

  async update(
    id: number,
    updateCategoriaDto: UpdateCategoriaDto,
  ): Promise<Categoria> {
    try {
      const categoria = await this.findOne(id);
      this.categoriaRepository.merge(categoria, updateCategoriaDto);
      return await this.categoriaRepository.save(categoria);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error al actualizar la categoría',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const result = await this.categoriaRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Categoría con ID ${id} no encontrada`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la categoría');
    }
  }
}
