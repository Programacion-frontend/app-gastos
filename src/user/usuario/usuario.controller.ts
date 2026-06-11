import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/Update-usuario.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator'; // Importar
import { Usuario } from './entity/usuario.entity'; // Importar

@ApiTags('Usuarios')
@ApiCookieAuth('access_token')
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  @Roles('admin')
  create(@Body(new ValidationPipe()) createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usuarioService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateUsuarioDto: UpdateUsuarioDto,
    @CurrentUser() currentUser: Usuario, // <--- Inyectamos quien hace la petición
  ) {
    return this.usuarioService.update(id, updateUsuarioDto, currentUser);
  }

  @Delete(':id')
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUser: Usuario, // <--- Inyectamos quien hace la petición
  ) {
    return this.usuarioService.remove(id, currentUser);
  }
}
