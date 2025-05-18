import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    return this.prisma.event.create({
      data: createEventDto
    });
  }

  async findAll() {
    return this.prisma.event.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        location: true,
        maxParticipants: true,
        createdAt: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        location: true,
        maxParticipants: true,
        createdAt: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException('Подію не знайдено');
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    try {
      return await this.prisma.event.update({
        where: { id },
        data: updateEventDto
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Подію не знайдено');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.event.delete({
        where: { id }
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Подію не знайдено');
      }
      throw error;
    }
  }

  async findUserEvents(userId: number) {
    return this.prisma.event.findMany({
      where: {
        participants: {
          some: {
            userId
          }
        }
      },
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        location: true,
        maxParticipants: true,
        createdAt: true,
        _count: {
          select: {
            participants: true
          }
        }
      }
    });
  }
}
