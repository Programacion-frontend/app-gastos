import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

import { MovimientoService } from './movimiento.service';
import { Movimiento } from './entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria } from '../../categoria/entity/categoria.entity';
import { Moneda } from '../../moneda/entity/moneda.entity';
import { Tag } from '../../tag/entity/tag.entity';
import { Prestamo } from '../../prestamo/prestamos/entity/prestamo.entity';
import { Abono } from '../../prestamo/abono/entity/abono.entity';

describe('MovimientoService', () => {
  let service: MovimientoService;
  let movimientoRepo: any;
  let usuarioRepo: any;
  let categoriaRepo: any;

  const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x) => x),
    save: jest.fn((x) => Promise.resolve({ id_movimiento: 1, ...x })),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovimientoService,
        { provide: getRepositoryToken(Movimiento), useValue: mockRepo() },
        { provide: getRepositoryToken(Usuario), useValue: mockRepo() },
        { provide: getRepositoryToken(Categoria), useValue: mockRepo() },
        { provide: getRepositoryToken(Moneda), useValue: mockRepo() },
        { provide: getRepositoryToken(Tag), useValue: mockRepo() },
        { provide: getRepositoryToken(Prestamo), useValue: mockRepo() },
        { provide: getRepositoryToken(Abono), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(MovimientoService);
    movimientoRepo = module.get(getRepositoryToken(Movimiento));
    usuarioRepo = module.get(getRepositoryToken(Usuario));
    categoriaRepo = module.get(getRepositoryToken(Categoria));
  });

  describe('create', () => {
    const dto = {
      monto: 100,
      fecha: '2026-01-01',
      descripcion: 'Compra',
      id_categoria: 5,
    } as any;

    it('asigna el movimiento al usuario actual (no admin)', async () => {
      const currentUser = { id_usuario: 1, rol: { nombre: 'usuario' } };
      usuarioRepo.findOne.mockResolvedValue(currentUser);
      categoriaRepo.findOne.mockResolvedValue({ id_categoria: 5 });

      const result = await service.create(dto, { id_usuario: 1 } as Usuario);

      const creado = movimientoRepo.create.mock.calls[0][0];
      expect(creado.usuario).toBe(currentUser);
      expect(creado.monto).toBe(100);
      expect(result.id_movimiento).toBe(1);
    });

    it('impide que un usuario no admin asigne un movimiento a otro usuario', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        rol: { nombre: 'usuario' },
      });

      await expect(
        service.create({ ...dto, id_usuario: 2 }, { id_usuario: 1 } as Usuario),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('permite a un admin asignar el movimiento a otro usuario', async () => {
      const admin = { id_usuario: 1, rol: { nombre: 'admin' } };
      const otro = { id_usuario: 2, rol: { nombre: 'usuario' } };
      usuarioRepo.findOne
        .mockResolvedValueOnce(admin) // currentUser
        .mockResolvedValueOnce(otro); // userToAssign
      categoriaRepo.findOne.mockResolvedValue({ id_categoria: 5 });

      await service.create({ ...dto, id_usuario: 2 }, {
        id_usuario: 1,
      } as Usuario);

      const creado = movimientoRepo.create.mock.calls[0][0];
      expect(creado.usuario).toBe(otro);
    });

    it('lanza NotFoundException si el usuario actual no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(dto, { id_usuario: 99 } as Usuario),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('lanza NotFoundException si la categoría no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        rol: { nombre: 'usuario' },
      });
      categoriaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.create(dto, { id_usuario: 1 } as Usuario),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('findId', () => {
    it('prohíbe el acceso a un movimiento de otro usuario (no admin)', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        rol: { nombre: 'usuario' },
      });
      movimientoRepo.findOne.mockResolvedValue({
        id_movimiento: 7,
        usuario: { id_usuario: 2 },
      });

      await expect(
        service.findId(7, { id_usuario: 1 } as Usuario),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('devuelve el movimiento si pertenece al usuario actual', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        rol: { nombre: 'usuario' },
      });
      const movimiento = { id_movimiento: 7, usuario: { id_usuario: 1 } };
      movimientoRepo.findOne.mockResolvedValue(movimiento);

      const result = await service.findId(7, { id_usuario: 1 } as Usuario);
      expect(result).toBe(movimiento);
    });
  });

  describe('delete', () => {
    it('elimina el movimiento propio y devuelve mensaje de confirmación', async () => {
      movimientoRepo.findOne.mockResolvedValue({
        id_movimiento: 3,
        usuario: { id_usuario: 1 },
      });
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        rol: { nombre: 'usuario' },
      });

      const result = await service.delete(3, { id_usuario: 1 } as Usuario);

      expect(movimientoRepo.remove).toHaveBeenCalled();
      expect(result.message).toContain('3');
    });
  });
});
