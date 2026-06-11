import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  ParseIntPipe,
} from '@nestjs/common';
import { MonedaService } from './moneda.service';
import { CreateMonedaDto } from './dto/create-moneda.dto';
import { UpdateMonedaDto } from './dto/update-moneda.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Monedas')
@ApiCookieAuth('access_token')
@Controller('monedas')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonedaController {
  constructor(private readonly monedaService: MonedaService) {}

  @Post()
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createMonedaDto: CreateMonedaDto) {
    return this.monedaService.create(createMonedaDto);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll() {
    return this.monedaService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.monedaService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMonedaDto: UpdateMonedaDto,
  ) {
    return this.monedaService.update(id, updateMonedaDto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.monedaService.remove(id);
  }
}
