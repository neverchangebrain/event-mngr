import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ description: 'Назва події' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Опис події' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Дата події', example: '2024-05-15T18:00:00.000Z' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ description: 'Місце проведення' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiProperty({ description: 'Максимальна кількість учасників' })
  @IsNumber()
  @Min(1)
  maxParticipants: number;
}
