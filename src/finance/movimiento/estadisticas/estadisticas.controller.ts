import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Estadísticas')
@ApiCookieAuth('access_token')
@Controller('movimientos/estadisticas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('ingresos')
  @Roles('admin', 'usuario')
  estadisticasIngresos(
    @CurrentUser() user: Usuario,
    @Query('mes') mes?: number,
    @Query('anio') anio?: number,
  ) {
    return this.estadisticasService.obtenerEstadisticas(
      'ingreso',
      user,
      mes ? Number(mes) : undefined,
      anio ? Number(anio) : undefined,
    );
  }

  @Get('gastos')
  @Roles('admin', 'usuario')
  estadisticasGastos(
    @CurrentUser() user: Usuario,
    @Query('mes') mes?: number,
    @Query('anio') anio?: number,
  ) {
    return this.estadisticasService.obtenerEstadisticas(
      'gasto',
      user,
      mes ? Number(mes) : undefined,
      anio ? Number(anio) : undefined,
    );
  }
}