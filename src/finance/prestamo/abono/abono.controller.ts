import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Delete,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AbonoService } from './abono.service';
import { CreateAbonoDto } from './dto/create-abono.dto';
import { UpdateAbonoDto } from './dto/update-abono.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Controller('abonos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AbonoController {
  constructor(private readonly abonoService: AbonoService) {}

  @Get()
  @Roles('admin', 'usuario')
  findAll(@CurrentUser() user: Usuario) {
    return this.abonoService.findAll(user);
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.abonoService.findOne(+id, user);
  }

  @Post('prestamo/:prestamoId')
  @Roles('admin', 'usuario')
  create(
    @Param('prestamoId') prestamoId: string,
    @Body(new ValidationPipe()) createAbonoDto: CreateAbonoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.abonoService.create(+prestamoId, createAbonoDto, user);
  }

  @Post(':id/generar-gasto')
  @Roles('admin', 'usuario')
  generarGasto(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.abonoService.createGastoFromAbono(+id, user);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateAbonoDto: UpdateAbonoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.abonoService.update(+id, updateAbonoDto, user);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.abonoService.remove(+id, user);
  }

  @Delete(':id/generar-gasto')
  @Roles('admin', 'usuario')
  revertirGasto(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.abonoService.revertGastoFromAbono(+id, user);
  }
}
