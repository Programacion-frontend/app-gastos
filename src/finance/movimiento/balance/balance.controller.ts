import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Balance')
@ApiCookieAuth('access_token')
@Controller('movimientos/balance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  @Roles('admin', 'usuario')
  obtenerBalance(
    @CurrentUser() user: Usuario,
    @Query('mes') mes?: number,
    @Query('anio') anio?: number,
  ) {
    return this.balanceService.obtenerBalance(
      user,
      mes ? Number(mes) : undefined,
      anio ? Number(anio) : undefined,
    );
  }

  @Get('historial/:anio')
  @Roles('admin', 'usuario')
  obtenerHistorialBalance(
    @CurrentUser() user: Usuario,
    @Param('anio', ParseIntPipe) anio: number,
  ) {
    return this.balanceService.obtenerHistorialBalance(user, anio);
  }
}
