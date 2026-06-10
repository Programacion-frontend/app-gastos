/**
 * Script de carga de datos iniciales (seed).
 *
 * Uso:  npm run seed
 *
 * - Limpia los datos previos de las tablas sembradas ANTES de insertar.
 * - PROTECCIÓN: se niega a ejecutarse contra una base de datos de producción.
 *   Para forzarlo intencionalmente: SEED_FORCE=true npm run seed
 *
 * Reutiliza la configuración de TypeORM definida en AppModule, por lo que
 * usa las mismas variables de entorno (.env) que el resto de la aplicación.
 */
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { AppModule } from './app.module';
import { Rol } from './user/rol/entity/rol.entity';
import { Genero } from './user/genero/entity/genero.entity';
import { Usuario } from './user/usuario/entity/usuario.entity';
import { PerfilUsuario } from './user/perfil/entity/perfil_usuario.entity';
import { Moneda } from './finance/moneda/entity/moneda.entity';
import { Categoria } from './finance/categoria/entity/categoria.entity';
import { Movimiento } from './finance/movimiento/movimiento/entity/movimiento.entity';

/**
 * Orden de limpieza: de las tablas "hijas" a las "padres" para no chocar con
 * llaves foráneas. Se desactivan temporalmente las FK por seguridad (MySQL).
 */
const TABLES_TO_CLEAN = [
  'movimiento_tag',
  'abono',
  'movimiento',
  'prestamo',
  'presupuesto',
  'notificacion',
  'tag',
  'perfil_usuario',
  'usuario',
  'categoria',
  'moneda',
  'genero',
  'rol',
];

async function limpiarDatos(dataSource: DataSource) {
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  try {
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0;');
    for (const tabla of TABLES_TO_CLEAN) {
      const existe: Array<unknown> = await queryRunner.query(
        `SHOW TABLES LIKE '${tabla}';`,
      );
      if (existe.length > 0) {
        await queryRunner.query(`TRUNCATE TABLE \`${tabla}\`;`);
        console.log(`  🧹 Tabla limpiada: ${tabla}`);
      }
    }
    await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1;');
  } finally {
    await queryRunner.release();
  }
}

async function bootstrap() {
  // ---- PROTECCIÓN: no ejecutar en producción salvo orden explícita ----
  const isProd = process.env.NODE_ENV === 'production';
  const force = process.env.SEED_FORCE === 'true';
  if (isProd && !force) {
    console.error(
      '⛔ Seed cancelado: NODE_ENV=production. ' +
        'Usa SEED_FORCE=true para forzarlo solo si estás completamente seguro.',
    );
    process.exit(1);
  }

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const dataSource = app.get(DataSource);

  try {
    console.log('🌱 Iniciando seed de la base de datos...');

    console.log('🧹 Limpiando datos previos...');
    await limpiarDatos(dataSource);

    // ---- Roles ----
    const rolRepo = dataSource.getRepository(Rol);
    const [rolAdmin, rolUsuario] = await rolRepo.save([
      rolRepo.create({ nombre: 'admin' }),
      rolRepo.create({ nombre: 'usuario' }),
    ]);
    console.log('  ✅ Roles creados (admin, usuario)');

    // ---- Géneros ----
    const generoRepo = dataSource.getRepository(Genero);
    const [generoMasc] = await generoRepo.save([
      generoRepo.create({ nombre: 'Masculino' }),
      generoRepo.create({ nombre: 'Femenino' }),
      generoRepo.create({ nombre: 'Otro' }),
    ]);
    console.log('  ✅ Géneros creados');

    // ---- Monedas ----
    const monedaRepo = dataSource.getRepository(Moneda);
    await monedaRepo.save([
      monedaRepo.create({ codigo: 'COP', simbolo: '$', tasa_cambio: 1.0 }),
      monedaRepo.create({ codigo: 'USD', simbolo: 'US$', tasa_cambio: 4000.0 }),
      monedaRepo.create({ codigo: 'EUR', simbolo: '€', tasa_cambio: 4300.0 }),
    ]);
    console.log('  ✅ Monedas creadas');

    // ---- Categorías base por defecto: Ingresos y Gastos ----
    const categoriaRepo = dataSource.getRepository(Categoria);
    const [catIngreso, catGasto] = await categoriaRepo.save([
      categoriaRepo.create({ tipo_categoria: 'ingreso' }),
      categoriaRepo.create({ tipo_categoria: 'gasto' }),
    ]);
    console.log('  ✅ Categorías base creadas (Ingresos y Gastos)');

    // ---- Usuarios (con perfil) ----
    const usuarioRepo = dataSource.getRepository(Usuario);
    const perfilRepo = dataSource.getRepository(PerfilUsuario);
    const salt = await bcrypt.genSalt(10);

    const adminUser = await usuarioRepo.save(
      usuarioRepo.create({
        email: 'admin@migasto.com',
        password: await bcrypt.hash('Admin123', salt),
        rol: rolAdmin,
      }),
    );
    await perfilRepo.save(
      perfilRepo.create({
        nombre_completo: 'Administrador MiGasto',
        edad: '30',
        telefono: '3000000000',
        genero: generoMasc,
        usuario: adminUser,
      }),
    );

    const demoUser = await usuarioRepo.save(
      usuarioRepo.create({
        email: 'usuario@migasto.com',
        password: await bcrypt.hash('Usuario123', salt),
        rol: rolUsuario,
      }),
    );
    await perfilRepo.save(
      perfilRepo.create({
        nombre_completo: 'Usuario Demo',
        edad: '25',
        telefono: '3001112233',
        genero: generoMasc,
        usuario: demoUser,
      }),
    );
    console.log('  ✅ Usuarios creados (admin@migasto.com / usuario@migasto.com)');

    // ---- Movimientos de ejemplo para el usuario demo ----
    const movimientoRepo = dataSource.getRepository(Movimiento);
    await movimientoRepo.save([
      movimientoRepo.create({
        monto: 2500000,
        fecha: new Date(),
        descripcion: 'Salario mensual',
        categoria: catIngreso,
        usuario: demoUser,
      }),
      movimientoRepo.create({
        monto: 350000,
        fecha: new Date(),
        descripcion: 'Mercado del mes',
        categoria: catGasto,
        usuario: demoUser,
      }),
    ]);
    console.log('  ✅ Movimientos de ejemplo creados');

    console.log('🎉 Seed completado correctamente.');
    console.log('   Admin   -> admin@migasto.com   / Admin123');
    console.log('   Usuario -> usuario@migasto.com / Usuario123');
  } catch (error) {
    console.error('❌ Error ejecutando el seed:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

void bootstrap();
