import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;
  const mockEvent = {
    id: 1,
    name: 'Test Event',
    description: 'Test Description',
    date: new Date('2025-12-31').toISOString(),
    location: 'Test Location',
    maxParticipants: 100,
    createdAt: new Date()
  };

  const mockEventWithCount = {
    ...mockEvent,
    _count: {
      participants: 5
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn()
            }
          }
        }
      ]
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new event', async () => {
      const createEventDto: CreateEventDto = {
        name: 'Test Event',
        description: 'Test Description',
        date: '2025-12-31T12:00:00.000Z',
        location: 'Test Location',
        maxParticipants: 100
      };

      (prismaService.event.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.create(createEventDto);

      expect(result).toEqual(mockEvent);
      expect(prismaService.event.create).toHaveBeenCalledWith({
        data: createEventDto
      });
    });
  });

  describe('findAll', () => {
    it('should return an array of events with participant counts', async () => {
      const mockEvents = [mockEventWithCount, mockEventWithCount];

      (prismaService.event.findMany as jest.Mock).mockResolvedValue(mockEvents);

      const result = await service.findAll();

      expect(result).toEqual(mockEvents);
      expect(prismaService.event.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('findOne', () => {
    it('should return a single event with participant count', async () => {
      (prismaService.event.findUnique as jest.Mock).mockResolvedValue(mockEventWithCount);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEventWithCount);
      expect(prismaService.event.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
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
    });

    it('should throw NotFoundException when event is not found', async () => {
      (prismaService.event.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(prismaService.event.findUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: expect.any(Object)
      });
    });
  });
  describe('update', () => {
    it('should update an existing event', async () => {
      const updateEventDto: UpdateEventDto = {
        name: 'Updated Event',
        maxParticipants: 150
      };

      const updatedEvent = {
        ...mockEvent,
        name: 'Updated Event',
        maxParticipants: 150
      };

      (prismaService.event.update as jest.Mock).mockResolvedValue(updatedEvent);

      const result = await service.update(1, updateEventDto);

      expect(result).toEqual(updatedEvent);
      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateEventDto
      });
    });

    it('should throw NotFoundException when trying to update non-existent event', async () => {
      const updateEventDto = { name: 'Updated Event' };

      // Mock the update to throw an error with the P2025 code
      (prismaService.event.update as jest.Mock).mockRejectedValue({
        code: 'P2025',
        message: 'Record to update not found'
      });

      await expect(service.update(999, updateEventDto)).rejects.toThrow(NotFoundException);
    });
  });
  describe('remove', () => {
    it('should delete an event', async () => {
      (prismaService.event.delete as jest.Mock).mockResolvedValue(mockEvent);

      const result = await service.remove(1);

      expect(result).toEqual(mockEvent);
      expect(prismaService.event.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
    });

    it('should throw NotFoundException when trying to delete non-existent event', async () => {
      // Mock the delete to throw an error with the P2025 code
      (prismaService.event.delete as jest.Mock).mockRejectedValue({
        code: 'P2025',
        message: 'Record to delete not found'
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
