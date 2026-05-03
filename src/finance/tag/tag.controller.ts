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
  Query,
} from '@nestjs/common';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { CurrentUser } from 'src/auth/decorator/user.decorator';
import { Usuario } from 'src/user/usuario/entity/usuario.entity';

@Controller('tags')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @Roles('admin', 'usuario')
  create(
    @Body(new ValidationPipe()) createTagDto: CreateTagDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.tagService.create(createTagDto, user);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll(
    @CurrentUser() user: Usuario,
    @Query('categoriaId') categoriaId?: string,
  ) {
    const catId = categoriaId ? parseInt(categoriaId) : undefined;
    return this.tagService.findAll(user, catId);
  }

  @Get('gastos')
  @Roles('admin', 'usuario')
  findGastos(@CurrentUser() user: Usuario) {
    return this.tagService.findByTipoCategoria(user, 'gasto');
  }

  @Get('ingresos')
  @Roles('admin', 'usuario')
  findIngresos(@CurrentUser() user: Usuario) {
    return this.tagService.findByTipoCategoria(user, 'ingreso');
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Usuario) {
    return this.tagService.findOne(id, user);
  }

  @Patch(':id')
  @Roles('admin', 'usuario')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateTagDto: UpdateTagDto,
    @CurrentUser() user: Usuario,
  ) {
    return this.tagService.update(id, updateTagDto, user);
  }

  @Delete(':id')
  @Roles('admin', 'usuario')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: Usuario) {
    return this.tagService.remove(id, user);
  }
}
