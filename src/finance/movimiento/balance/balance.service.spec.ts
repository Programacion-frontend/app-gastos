import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { BalanceService } from './balance.service';
import { Movimiento } from '../movimiento/entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

/** Helper para crear un movimiento de prueba. */
const mov = (
  monto: number,
  tipo: 'ingreso' | 'gasto',
  fecha: Date,
): Partial<Movimiento> => ({
  monto,
  fecha,
  categoria: { tipo_categoria: tipo } as any,
});

describe('BalanceService', () => {
  let service: BalanceService;
  let movimientoRepo: jest.Mocked<Pick<Repository<Movimiento>, 'find'>>;
  let usuarioRepo: jest.Mocked<Pick<Repository<Usuario>, 'findOne'>>;

  const usuarioActual = { id_usuario: 1 } as Usuario;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getRepositoryToken(Movimiento),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get(BalanceService);
    movimientoRepo = module.get(getRepositoryToken(Movimiento));
    usuarioRepo = module.get(getRepositoryToken(Usuario));

    // Por defecto el usuario existe y NO es admin.
    usuarioRepo.findOne.mockResolvedValue({
      id_usuario: 1,
      rol: { nombre: 'usuario' },
    } as any);
  });

  it('calcula totales, balance y promedios correctamente', async () => {
    movimientoRepo.find.mockResolvedValue([
      mov(1000, 'ingreso', new Date('2026-01-10')),
      mov(500, 'ingreso', new Date('2026-01-15')),
      mov(200, 'gasto', new Date('2026-01-20')),
      mov(100, 'gasto', new Date('2026-01-25')),
    ] as Movimiento[]);

    const result = await service.obtenerBalance(usuarioActual);

    expect(result.totalIngresos).toBe(1500);
    expect(result.totalGastos).toBe(300);
    expect(result.balance).toBe(1200);
    expect(result.resumen).toBe('Saldo positivo');
    expect(result.estadisticas.cantidadIngresos).toBe(2);
    expect(result.estadisticas.cantidadGastos).toBe(2);
    expect(result.estadisticas.promedioIngreso).toBe(750);
    expect(result.estadisticas.promedioGasto).toBe(150);
  });

  it('reporta saldo negativo cuando los gastos superan los ingresos', async () => {
    movimientoRepo.find.mockResolvedValue([
      mov(100, 'ingreso', new Date('2026-02-01')),
      mov(400, 'gasto', new Date('2026-02-02')),
    ] as Movimiento[]);

    const result = await service.obtenerBalance(usuarioActual);

    expect(result.balance).toBe(-300);
    expect(result.resumen).toBe('Saldo negativo');
  });

  it('trata los montos string (decimales de TypeORM) como números', async () => {
    movimientoRepo.find.mockResolvedValue([
      { monto: '1500.50', fecha: new Date('2026-03-01'), categoria: { tipo_categoria: 'ingreso' } },
      { monto: '500.25', fecha: new Date('2026-03-02'), categoria: { tipo_categoria: 'gasto' } },
    ] as any);

    const result = await service.obtenerBalance(usuarioActual);

    expect(result.totalIngresos).toBeCloseTo(1500.5);
    expect(result.totalGastos).toBeCloseTo(500.25);
    expect(result.balance).toBeCloseTo(1000.25);
  });

  it('lanza NotFoundException cuando no hay movimientos', async () => {
    movimientoRepo.find.mockResolvedValue([]);

    await expect(service.obtenerBalance(usuarioActual)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('lanza NotFoundException si el usuario no existe', async () => {
    usuarioRepo.findOne.mockResolvedValue(null);

    await expect(service.obtenerBalance(usuarioActual)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  describe('obtenerHistorialBalance', () => {
    it('agrupa ingresos y gastos por mes y calcula el balance anual', async () => {
      movimientoRepo.find.mockResolvedValue([
        mov(1000, 'ingreso', new Date('2026-01-10')),
        mov(300, 'gasto', new Date('2026-01-20')),
        mov(2000, 'ingreso', new Date('2026-02-05')),
      ] as Movimiento[]);

      const result = await service.obtenerHistorialBalance(usuarioActual, 2026);

      expect(result.anio).toBe(2026);
      expect(result.totalIngresos).toBe(3000);
      expect(result.totalGastos).toBe(300);
      expect(result.balanceAnual).toBe(2700);
      expect(result.detalleMensual).toHaveLength(2);

      const enero = result.detalleMensual.find((m) => m.mes === 1);
      expect(enero?.balance).toBe(700);
    });
  });
});
