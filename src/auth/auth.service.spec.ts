import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import { AuthService } from './auth.service';
import { MailService } from '../mail/mail.service';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { Rol } from 'src/user/rol/entity/rol.entity';
import { PerfilUsuario } from 'src/user/perfil/entity/perfil_usuario.entity';
import { Genero } from 'src/user/genero/entity/genero.entity';

import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let usuarioRepo: any;
  let rolRepo: any;
  let generoRepo: any;
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    jwtService = { sign: jest.fn().mockReturnValue('fake.jwt.token') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn((x) => x),
            save: jest.fn((x) => x),
          },
        },
        {
          provide: getRepositoryToken(Rol),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: getRepositoryToken(PerfilUsuario),
          useValue: {
            create: jest.fn((x) => x),
            // TypeORM.save() asigna el id sobre la misma instancia (in place).
            save: jest.fn((x) => {
              x.id_perfil = 99;
              return Promise.resolve(x);
            }),
          },
        },
        {
          provide: getRepositoryToken(Genero),
          useValue: { findOne: jest.fn() },
        },
        { provide: ConfigService, useValue: { get: jest.fn() } },
        { provide: MailService, useValue: { sendPasswordResetOtp: jest.fn() } },
      ],
    }).compile();

    service = module.get(AuthService);
    usuarioRepo = module.get(getRepositoryToken(Usuario));
    rolRepo = module.get(getRepositoryToken(Rol));
    generoRepo = module.get(getRepositoryToken(Genero));

    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
  });

  describe('registerUser', () => {
    const dto = {
      email: 'nuevo@migasto.com',
      password: 'secret123',
      rolId: 2,
      nombre_completo: 'Nuevo Usuario',
      id_genero: 1,
    } as any;

    beforeEach(() => {
      rolRepo.findOne.mockResolvedValue({ id: 2, nombre: 'usuario' });
      generoRepo.findOne.mockResolvedValue({
        id_genero: 1,
        nombre: 'Masculino',
      });
      usuarioRepo.findOne.mockResolvedValue(null);
      usuarioRepo.save.mockResolvedValue({
        id_usuario: 10,
        email: dto.email,
        rol: { nombre: 'usuario' },
      });
    });

    it('crea el usuario SIN generar ni devolver un token JWT', async () => {
      const result = await service.registerUser(dto);

      // El registro solo crea al usuario: nunca debe firmar un token.
      expect(jwtService.sign).not.toHaveBeenCalled();
      expect(result).not.toHaveProperty('access_token');
      expect(result.usuario.email).toBe(dto.email);
      expect(result.perfil.id_perfil).toBeDefined();
    });

    it('hashea la contraseña antes de guardarla', async () => {
      await service.registerUser(dto);

      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 'salt');
      const guardado = usuarioRepo.create.mock.calls[0][0];
      expect(guardado.password).toBe('hashed-password');
      expect(guardado.password).not.toBe(dto.password);
    });

    it('rechaza el registro si el email ya existe', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        email: dto.email,
      });

      await expect(service.registerUser(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('rechaza el registro si el rol no existe', async () => {
      rolRepo.findOne.mockResolvedValue(null);

      await expect(service.registerUser(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('validateUser', () => {
    it('devuelve el usuario sin la contraseña cuando las credenciales son válidas', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        email: 'a@a.com',
        password: 'hashed',
        rol: { nombre: 'usuario' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('a@a.com', 'plain');

      expect(result).toBeTruthy();
      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('a@a.com');
    });

    it('devuelve null cuando la contraseña es incorrecta', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        password: 'hashed',
        rol: { nombre: 'usuario' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('a@a.com', 'wrong');

      expect(result).toBeNull();
    });

    it('devuelve null cuando el usuario no existe', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nope@a.com', 'x');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('lanza UnauthorizedException con credenciales incorrectas', async () => {
      usuarioRepo.findOne.mockResolvedValue(null);

      await expect(service.login('a@a.com', 'bad')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('genera un token cuando las credenciales son válidas', async () => {
      usuarioRepo.findOne.mockResolvedValue({
        id_usuario: 1,
        email: 'a@a.com',
        password: 'hashed',
        rol: { nombre: 'usuario' },
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('a@a.com', 'plain');

      expect(jwtService.sign).toHaveBeenCalled();
      expect(result.access_token).toBe('fake.jwt.token');
    });
  });
});
