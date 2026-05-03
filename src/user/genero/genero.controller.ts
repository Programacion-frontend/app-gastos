import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { GeneroService } from './genero.service';
import { CreateGeneroDto } from './dto/create-genero.dto';
import { UpdateGeneroDto } from './dto/Update-genero.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/jwt-auth/roles.guard';
import { Roles } from 'src/auth/decorator/roles.decorator';

@Controller('genero')
export class GeneroController {
  constructor(private readonly generoService: GeneroService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body(new ValidationPipe()) createGeneroDto: CreateGeneroDto) {
    return this.generoService.create(createGeneroDto);
  }

  @Get()
  @Roles('admin', 'usuario')
  findAll() {
    return this.generoService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'usuario')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.generoService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe()) updateGeneroDto: UpdateGeneroDto,
  ) {
    return this.generoService.update(id, updateGeneroDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.generoService.remove(id);
  }
}
