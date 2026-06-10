import { instanceToPlain } from 'class-transformer';

import { Movimiento } from './entity/movimiento.entity';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Categoria } from '../../categoria/entity/categoria.entity';

/**
 * Los endpoints de movimientos (findId / update) cargan la relación `usuario`.
 * Verifica que al serializar la respuesta no se expongan datos sensibles del
 * usuario dueño del movimiento.
 */
describe('Serialización de Movimiento (fuga de información)', () => {
  const construirMovimiento = (): Movimiento => {
    const usuario = new Usuario();
    usuario.id_usuario = 1;
    usuario.email = 'demo@migasto.com';
    usuario.password = '$2b$10$hashsupersecreto';
    usuario.passwordResetOTP = '111222';
    usuario.passwordResetExpires = new Date();
    usuario.passwordResetAttempts = 2;

    const categoria = new Categoria();
    categoria.id_categoria = 5;
    categoria.tipo_categoria = 'gasto';

    const movimiento = new Movimiento();
    movimiento.id_movimiento = 100;
    movimiento.monto = 350;
    movimiento.fecha = new Date('2026-01-15');
    movimiento.descripcion = 'Mercado';
    movimiento.usuario = usuario;
    movimiento.categoria = categoria;
    return movimiento;
  };

  it('NO expone password ni datos de recuperación del usuario anidado', () => {
    const plano: any = instanceToPlain(construirMovimiento());

    expect(plano.usuario).toBeDefined();
    expect(plano.usuario.password).toBeUndefined();
    expect(plano.usuario.passwordResetOTP).toBeUndefined();
    expect(plano.usuario.passwordResetExpires).toBeUndefined();
    expect(plano.usuario.passwordResetAttempts).toBeUndefined();
  });

  it('conserva los datos públicos del movimiento', () => {
    const plano: any = instanceToPlain(construirMovimiento());

    expect(plano.descripcion).toBe('Mercado');
    expect(plano.usuario.email).toBe('demo@migasto.com');
    expect(plano.categoria.tipo_categoria).toBe('gasto');
  });
});
