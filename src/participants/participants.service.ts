import { ConflictException, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { RegisterParticipantDto } from './dto/register-participant.dto';

@Injectable()
export class ParticipantsService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService
  ) {}

  async register(userId: number, registerDto: RegisterParticipantDto) {
    // Get the event
    const event = await this.eventsService.findOne(registerDto.eventId);

    // Check if event is full
    const currentParticipants = await this.prisma.participant.count({
      where: {
        eventId: registerDto.eventId
      }
    });

    if (currentParticipants >= event.maxParticipants) {
      throw new BadRequestException('Досягнуто максимальну кількість учасників для цієї події');
    }

    // Check if user is already registered
    const existingRegistration = await this.prisma.participant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: registerDto.eventId
        }
      }
    });

    if (existingRegistration) {
      throw new ConflictException('Користувач вже зареєстрований на цю подію');
    }

    // Register the user
    return this.prisma.participant.create({
      data: {
        userId,
        eventId: registerDto.eventId
      },
      include: {
        event: true
      }
    });
  }

  async unregister(userId: number, eventId: number) {
    const registration = await this.prisma.participant.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    });

    if (!registration) {
      throw new NotFoundException('Реєстрацію не знайдено');
    }

    return this.prisma.participant.delete({
      where: {
        id: registration.id
      }
    });
  }

  async getEventParticipants(eventId: number) {
    await this.eventsService.findOne(eventId); // Validate that event exists

    return this.prisma.participant.findMany({
      where: {
        eventId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
  }
}
