import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Події')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Створення нової події' })
  @ApiResponse({ status: 201, description: 'Подію створено' })
  create(@Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Отримання всіх подій' })
  @ApiResponse({ status: 200, description: 'Список всіх подій' })
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримання події за ідентифікатором' })
  @ApiResponse({ status: 200, description: 'Дані про подію' })
  @ApiResponse({ status: 404, description: 'Подію не знайдено' })
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Оновлення події' })
  @ApiResponse({ status: 200, description: 'Подію оновлено' })
  @ApiResponse({ status: 404, description: 'Подію не знайдено' })
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(+id, updateEventDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Видалення події' })
  @ApiResponse({ status: 200, description: 'Подію видалено' })
  @ApiResponse({ status: 404, description: 'Подію не знайдено' })
  remove(@Param('id') id: string) {
    return this.eventsService.remove(+id);
  }

  @Get('user/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримання всіх подій користувача' })
  @ApiResponse({ status: 200, description: 'Список подій користувача' })
  findUserEvents(@Request() req) {
    return this.eventsService.findUserEvents(req.user.id);
  }
}
