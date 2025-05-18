import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RegisterParticipantDto {
  @ApiProperty({ description: 'ID події' })
  @IsNumber()
  @IsNotEmpty()
  eventId: number;
}
