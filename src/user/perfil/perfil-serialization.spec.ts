import { instanceToPlain } from 'class-transformer';

import { PerfilUsuario } from './entity/perfil_usuario.entity';
import { Usuario } from '../usuario/entity/usuario.entity';
import { Genero } from '../genero/entity/genero.entity';

/**
 * Verifica que los endpoints de perfil (findAll / findByUser / findOne) que
 * cargan la relación `usuario` no filtren datos sensibles cuando el
 * ClassSerializerInterceptor global serializa la respuesta.
 */
describe('Serialización de PerfilUsuario (fuga de información)', () => {
  const construirPerfil = (): PerfilUsuario => {
    const usuario = new Usuario();
    usuario.id_usuario = 1;
    usuario.email = 'demo@migasto.com';
    usuario.password = '$2b$10$hashsupersecreto';
    usuario.passwordResetOTP = '987654';
    usuario.passwordResetExpires = new Date();
    usuario.passwordResetAttempts = 1;

    const genero = new Genero();
    genero.id_genero = 1;
    genero.nombre = 'Masculino';

    const perfil = new PerfilUsuario();
    perfil.id_perfil = 10;
    perfil.nombre_completo = 'Usuario Demo';
    perfil.edad = '25';
    perfil.telefono = '3001112233';
    perfil.usuario = usuario;
    perfil.genero = genero;
    return perfil;
  };

  it('NO expone password ni datos de recuperación del usuario anidado', () => {
    const plano: any = instanceToPlain(construirPerfil());

    expect(plano.usuario).toBeDefined();
    expect(plano.usuario.password).toBeUndefined();
    expect(plano.usuario.passwordResetOTP).toBeUndefined();
    expect(plano.usuario.passwordResetExpires).toBeUndefined();
    expect(plano.usuario.passwordResetAttempts).toBeUndefined();
  });

  it('conserva los datos públicos del perfil y del usuario', () => {
    const plano: any = instanceToPlain(construirPerfil());

    expect(plano.nombre_completo).toBe('Usuario Demo');
    expect(plano.usuario.email).toBe('demo@migasto.com');
    expect(plano.genero.nombre).toBe('Masculino');
  });
});
