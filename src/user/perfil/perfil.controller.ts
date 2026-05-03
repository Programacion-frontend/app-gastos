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
  Req,
} from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { CreatePerfilUsuarioDto } from './dto/create-perfil-usuario.dto';
import { UpdatePerfilUsuarioDto } from './dto/update-perfil-usuario.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('perfiles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PerfilController {
  constructor(private readonly perfilService: PerfilService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(
    @Body(new ValidationPipe()) createPerfilDto: CreatePerfilUsuarioDto,
    @Req() req,
  ) {
    return this.perfilService.create(createPerfilDto, req.user);
  }

  @Get()
  @Roles('admin')
  findAll() {
    return this.perfilService.findAll();
  }
  @Get('me')
  @Roles('admin', 'usuario')
  findMe(@Req() req) {
    return this.perfilService.findByUser(req.user);
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.perfilService.findOne(id, req.user);
  }

  @Patch('me')
  @Roles('admin', 'usuario')
  updateMyProfile(
    @Body(new ValidationPipe()) updatePerfilDto: UpdatePerfilUsuarioDto,
    @Req() req,
  ) {
    return this.perfilService.updateByUser(updatePerfilDto, req.user);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updatePerfilDto: UpdatePerfilUsuarioDto,
    @Req() req,
  ) {
    return this.perfilService.update(id, updatePerfilDto, req.user);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.perfilService.remove(id, req.user);
  }
}
