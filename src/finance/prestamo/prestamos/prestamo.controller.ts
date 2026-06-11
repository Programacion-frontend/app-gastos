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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PrestamoService } from './prestamo.service';
import { CreatePrestamoDto } from './dto/create-prestamo.dto';
import { UpdatePrestamoDto } from './dto/update-prestamo.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Préstamos')
@ApiCookieAuth('access_token')
@Controller('prestamos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrestamoController {
  constructor(private readonly prestamoService: PrestamoService) {}

  @Post()
  @Roles('admin', 'usuario')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ValidationPipe()) createPrestamoDto: CreatePrestamoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.prestamoService.create(createPrestamoDto, user);
  }

  @Get()
  @Roles('admin', 'usuario')
  @HttpCode(HttpStatus.OK)
  findAll(@CurrentUser() user: Usuario) {
    return this.prestamoService.findAll(user);
  }

  @Get('details')
  @Roles('admin', 'usuario')
  @HttpCode(HttpStatus.OK)
  getPrestamoDetails(@CurrentUser() user: Usuario) {
    return this.prestamoService.getPrestamoDetails(user);
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.prestamoService.findOne(+id, user);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatePrestamoDto: UpdatePrestamoDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.prestamoService.update(+id, updatePrestamoDto, user);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string, @CurrentUser() user: Usuario) {
    return this.prestamoService.remove(+id, user);
  }
}
