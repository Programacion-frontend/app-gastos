import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Moneda } from './entity/moneda.entity';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';

@Injectable()
export class MonedaService {
  constructor(
    @InjectRepository(Moneda)
    private readonly monedaRepository: Repository<Moneda>,
  ) {}

  //metodo crear moneda
  async create(
    createMonedaDto: CreateMonedaDto,
  ): Promise<{ message: string; data: Moneda }> {
    try {
      const moneda = this.monedaRepository.create(createMonedaDto);
      const savedMoneda = await this.monedaRepository.save(moneda);
      return { message: 'Moneda creada exitosamente', data: savedMoneda };
    } catch {
      throw new InternalServerErrorException('Error al crear la moneda');
    }
  }
  //Listar todas las monedas
  async findAll(): Promise<Moneda[]> {
    try {
      const monedas = await this.monedaRepository.find();
      if (monedas.length === 0) {
        throw new NotFoundException('No hay monedas registradas');
      }
      return monedas;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener las monedas');
    }
  }
  //Buscar moneda por ID
  async findOne(id: number): Promise<Moneda> {
    try {
      const moneda = await this.monedaRepository.findOne({
        where: { id_moneda: id },
      });
      if (!moneda) {
        throw new NotFoundException(`Moneda con ID ${id} no encontrada`);
      }
      return moneda;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al obtener la moneda');
    }
  }

  //Acualizar moneda
  async update(id: number, updateMonedaDto: UpdateMonedaDto): Promise<Moneda> {
    try {
      const moneda = await this.findOne(id);
      this.monedaRepository.merge(moneda, updateMonedaDto);
      return await this.monedaRepository.save(moneda);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al actualizar la moneda');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const result = await this.monedaRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Moneda con ID ${id} no encontrada`);
      }
      return { message: `Moneda con ID ${id} eliminada exitosamente` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al eliminar la moneda');
    }
  }
}
