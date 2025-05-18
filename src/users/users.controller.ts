import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Користувачі')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Створення нового користувача' })
  @ApiResponse({ status: 201, description: 'Користувача створено' })
  @ApiResponse({ status: 409, description: "Користувач з таким email або ім'ям вже існує" })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Отримання профілю поточного користувача' })
  @ApiResponse({ status: 200, description: 'Профіль отримано' })
  @ApiResponse({ status: 401, description: 'Неавторизований доступ' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }
}
