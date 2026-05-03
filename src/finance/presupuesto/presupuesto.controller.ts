import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PresupuestoService } from './presupuesto.service';
import { CreatePresupuestoDto } from './dto/create-presupuesto.dto';
import { UpdatePresupuestoDto } from './dto/update-presupuesto.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('presupuestos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PresupuestoController {
  constructor(private readonly presupuestoService: PresupuestoService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(@Body() createPresupuestoDto: CreatePresupuestoDto) {
    return this.presupuestoService.create(createPresupuestoDto);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll() {
    return this.presupuestoService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id') id: string) {
    return this.presupuestoService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(
    @Param('id') id: string,
    @Body() updatePresupuestoDto: UpdatePresupuestoDto,
  ) {
    return this.presupuestoService.update(+id, updatePresupuestoDto);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id') id: string) {
    return this.presupuestoService.remove(+id);
  }
}
