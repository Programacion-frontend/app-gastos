import { instanceToPlain } from 'class-transformer';

import { Rol } from './entity/rol.entity';
import { Usuario } from '../usuario/entity/usuario.entity';

/**
 * Verifica la corrección de la fuga de información sensible en api/rol.
 *
 * El ClassSerializerInterceptor (registrado globalmente en main.ts) usa
 * instanceToPlain, que respeta los @Exclude() de la entidad Usuario incluso
 * cuando ésta viene anidada dentro de la relación Rol.users.
 */
describe('Serialización de Rol (fuga de información)', () => {
  const construirRolConUsuario = (): Rol => {
    const usuario = new Usuario();
    usuario.id_usuario = 1;
    usuario.email = 'admin@migasto.com';
    usuario.password = '$2b$10$hashsupersecreto';
    usuario.passwordResetOTP = '123456';
    usuario.passwordResetExpires = new Date();
    usuario.passwordResetAttempts = 3;

    const rol = new Rol();
    rol.id = 1;
    rol.nombre = 'admin';
    rol.users = [usuario];
    return rol;
  };

  it('NO expone password ni los datos de recuperación de los usuarios anidados', () => {
    const plano: any = instanceToPlain(construirRolConUsuario());

    const usuarioPlano = plano.users[0];
    expect(usuarioPlano).toBeDefined();
    expect(usuarioPlano.password).toBeUndefined();
    expect(usuarioPlano.passwordResetOTP).toBeUndefined();
    expect(usuarioPlano.passwordResetExpires).toBeUndefined();
    expect(usuarioPlano.passwordResetAttempts).toBeUndefined();
  });

  it('conserva los campos públicos (id, email, nombre del rol)', () => {
    const plano: any = instanceToPlain(construirRolConUsuario());

    expect(plano.nombre).toBe('admin');
    expect(plano.users[0].email).toBe('admin@migasto.com');
    expect(plano.users[0].id_usuario).toBe(1);
  });
});
