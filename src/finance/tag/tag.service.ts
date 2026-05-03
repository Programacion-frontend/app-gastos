import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Tag } from './entity/tag.entity';
import { Categoria } from 'src/finance/categoria/entity/categoria.entity'; // Asegúrate de la ruta
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Injectable()
export class TagService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Categoria)
    private readonly categoriaRepository: Repository<Categoria>,
  ) {}

  private formatTagResponse(tag: Tag) {
    return {
      id_tag: tag.id_tag,
      nombre: tag.nombre,
      id_categoria: tag.categoria ? tag.categoria.id_categoria : null,
    };
  }

  private async findTagEntity(id_tag: number, user: Usuario): Promise<Tag> {
    const tag = await this.tagRepository.findOne({
      where: { id_tag },
      relations: ['usuario', 'categoria'],
      loadEagerRelations: false,
    });

    if (!tag) throw new NotFoundException(`Tag no encontrado.`);

    const isGlobal = tag.usuario === null;
    const isMine = tag.usuario?.id_usuario === user.id_usuario;

    if (!isGlobal && !isMine) {
      throw new NotFoundException(`Tag no encontrado.`);
    }
    return tag;
  }

  async create(createTagDto: CreateTagDto, user: Usuario): Promise<any> {
    try {
      const categoria = await this.categoriaRepository.findOne({
        where: { id_categoria: createTagDto.id_categoria },
      });
      if (!categoria)
        throw new NotFoundException('La categoría especificada no existe.');

      const isAdmin = user.rol?.nombre === 'admin';

      const whereCondition = isAdmin
        ? {
            nombre: createTagDto.nombre,
            usuario: IsNull(),
            categoria: { id_categoria: categoria.id_categoria },
          }
        : {
            nombre: createTagDto.nombre,
            usuario: { id_usuario: user.id_usuario },
            categoria: { id_categoria: categoria.id_categoria },
          };

      const existingTag = await this.tagRepository.findOne({
        where: whereCondition,
      });

      if (existingTag) {
        throw new BadRequestException(
          `Ya tienes un tag llamado "${createTagDto.nombre}" en la categoría "${categoria.tipo_categoria}".`,
        );
      }

      const tagData: any = {
        nombre: createTagDto.nombre,
        categoria: categoria,
      };

      if (!isAdmin) {
        tagData.usuario = user;
      }

      const newTag = this.tagRepository.create(tagData);

      await this.tagRepository.save(newTag);
      return {
        message: 'Tag creado correctamente',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      throw new BadRequestException(error.message);
    }
  }

  async findAll(user: Usuario, categoriaId?: number): Promise<any[]> {
    try {
      const userCondition = [
        { usuario: IsNull() },
        { usuario: { id_usuario: user.id_usuario } },
      ];
      let whereQuery: any = userCondition;

      if (categoriaId) {
        whereQuery = [
          { usuario: IsNull(), categoria: { id_categoria: categoriaId } },
          {
            usuario: { id_usuario: user.id_usuario },
            categoria: { id_categoria: categoriaId },
          },
        ];
      }

      const tags = await this.tagRepository.find({
        where: whereQuery,
        relations: ['categoria'],
        order: { nombre: 'ASC' },
      });

      if (!tags.length) return [];

      return tags.map((tag) => this.formatTagResponse(tag));
    } catch (error) {
      throw new BadRequestException(
        `Error al buscar los tags: ${error.message}`,
      );
    }
  }

  async findOne(id_tag: number, user: Usuario): Promise<any> {
    const tag = await this.findTagEntity(id_tag, user);
    return this.formatTagResponse(tag);
  }

  async findByTipoCategoria(user: Usuario, nombreTipo: string): Promise<any[]> {
    const categoria = await this.categoriaRepository.findOne({
      where: { tipo_categoria: nombreTipo },
    });

    if (!categoria) {
      return [];
    }
    return this.findAll(user, categoria.id_categoria);
  }

  async update(
    id_tag: number,
    updateTagDto: UpdateTagDto,
    user: Usuario,
  ): Promise<any> {
    const tag = await this.findTagEntity(id_tag, user);
    const isAdmin = user.rol?.nombre === 'admin';
    const isGlobal = tag.usuario === null;
    if (isGlobal && !isAdmin)
      throw new ForbiddenException('No puedes editar un tag global.');
    if (!isGlobal && tag.usuario.id_usuario !== user.id_usuario)
      throw new ForbiddenException('No puedes editar tags de otros usuarios.');
    if (updateTagDto.id_categoria) {
      const categoria = await this.categoriaRepository.findOne({
        where: { id_categoria: updateTagDto.id_categoria },
      });
      if (!categoria)
        throw new NotFoundException('La categoría especificada no existe.');
      tag.categoria = categoria;
    }

    if (updateTagDto.nombre || updateTagDto.id_categoria) {
      const targetNombre = updateTagDto.nombre || tag.nombre;
      const targetCategoriaId =
        updateTagDto.id_categoria || tag.categoria.id_categoria;

      const whereCondition = isGlobal
        ? {
            nombre: targetNombre,
            usuario: IsNull(),
            categoria: { id_categoria: targetCategoriaId },
          }
        : {
            nombre: targetNombre,
            usuario: { id_usuario: user.id_usuario },
            categoria: { id_categoria: targetCategoriaId },
          };

      const duplicate = await this.tagRepository.findOne({
        where: whereCondition,
      });

      if (duplicate && duplicate.id_tag !== id_tag) {
        throw new BadRequestException(
          `Ya existe un tag "${targetNombre}" en esa categoría.`,
        );
      }

      if (updateTagDto.nombre) tag.nombre = updateTagDto.nombre;
    }

    const savedTag = await this.tagRepository.save(tag);
    return this.formatTagResponse(savedTag);
  }

  async remove(id_tag: number, user: Usuario): Promise<{ message: string }> {
    const tag = await this.findTagEntity(id_tag, user);
    const isAdmin = user.rol?.nombre === 'admin';
    const isGlobal = tag.usuario === null;

    if (isGlobal && !isAdmin)
      throw new ForbiddenException('No puedes eliminar un tag global.');
    if (!isGlobal && tag.usuario.id_usuario !== user.id_usuario)
      throw new ForbiddenException(
        'No puedes eliminar tags de otros usuarios.',
      );

    await this.tagRepository.remove(tag);
    return { message: 'Tag eliminado correctamente' };
  }
}
