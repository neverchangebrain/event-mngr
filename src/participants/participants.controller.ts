import { Controller, Post, Body, Param, Delete, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParticipantsService } from './participants.service';
import { RegisterParticipantDto } from './dto/register-participant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Учасники')
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post('register')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Реєстрація користувача на подію' })
  @ApiResponse({ status: 201, description: 'Реєстрацію успішно створено' })
  @ApiResponse({ status: 400, description: 'Досягнуто максимальну кількість учасників для цієї події' })
  @ApiResponse({ status: 409, description: 'Користувач вже зареєстрований на цю подію' })
  register(@Request() req, @Body() registerDto: RegisterParticipantDto) {
    return this.participantsService.register(req.user.id, registerDto);
  }

  @Delete('unregister/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Скасування реєстрації користувача на подію' })
  @ApiResponse({ status: 200, description: 'Реєстрацію скасовано' })
  @ApiResponse({ status: 404, description: 'Реєстрацію не знайдено' })
  unregister(@Request() req, @Param('eventId') eventId: string) {
    return this.participantsService.unregister(req.user.id, +eventId);
  }

  @Get('event/:eventId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримання списку учасників події' })
  @ApiResponse({ status: 200, description: 'Список учасників' })
  @ApiResponse({ status: 404, description: 'Подію не знайдено' })
  getEventParticipants(@Param('eventId') eventId: string) {
    return this.participantsService.getEventParticipants(+eventId);
  }
}
