import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolModule } from './user/rol/rol.module';
import { UsuarioModule } from './user/usuario/usuario.module';
import { PerfilUsuarioModule } from './user/perfil/perfil.module';
import { CategoriaModule } from './finance/categoria/categoria.module';
import { MovimientoModule } from './finance/movimiento/movimiento/movimiento.module';
import { MonedaModule } from './finance/moneda/moneda.module';
import { PresupuestoModule } from './finance/presupuesto/presupuesto.module';
import { TagModule } from './finance/tag/tag.module';
import { NotificacionModule } from './notification/notificacion/notificacion.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeneroModule } from './user/genero/genero.module';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { PrestamoModule } from './finance/prestamo/prestamos/prestamo.module';
import { AbonoModule } from './finance/prestamo/abono/abono.module';
import { EstadisticasModule } from './finance/movimiento/estadisticas/estadisticas.module';
import { BalanceModule } from './finance/movimiento/balance/balance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    UsuarioModule,
    PerfilUsuarioModule,
    CategoriaModule,
    MonedaModule,
    PresupuestoModule,
    TagModule,
    NotificacionModule,
    GeneroModule,
    AuthModule,
    /* */
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASS'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,

        logging: false,
      }),
    }),
    RolModule,
    MailModule,
    PrestamoModule,
    AbonoModule,
    EstadisticasModule,
    BalanceModule,
    MovimientoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
