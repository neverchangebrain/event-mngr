import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsService } from './participants.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventsService } from '../events/events.service';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { RegisterParticipantDto } from './dto/register-participant.dto';

describe('ParticipantsService', () => {
  let service: ParticipantsService;
  let prismaService: PrismaService;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantsService,
        {
          provide: PrismaService,
          useValue: {
            participant: {
              count: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn()
            }
          }
        },
        {
          provide: EventsService,
          useValue: {
            findOne: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<ParticipantsService>(ParticipantsService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const userId = 1;
    const registerDto: RegisterParticipantDto = { eventId: 2 };
    const event = {
      id: 2,
      name: 'Test Event',
      description: 'Test Description',
      date: new Date(),
      location: 'Test Location',
      maxParticipants: 10,
      createdAt: new Date(),
      _count: { participants: 5 }
    };

    it('should register a participant successfully', async () => {
      // Mock event service to return an event
      (eventsService.findOne as jest.Mock).mockResolvedValue(event);

      // Mock count to return value less than max participants
      (prismaService.participant.count as jest.Mock).mockResolvedValue(5);

      // Mock findUnique to return null (user not already registered)
      (prismaService.participant.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock create to return the participant
      const participant = {
        id: 1,
        userId,
        eventId: registerDto.eventId,
        createdAt: new Date(),
        event
      };
      (prismaService.participant.create as jest.Mock).mockResolvedValue(participant);

      const result = await service.register(userId, registerDto);
      expect(result).toEqual(participant);
      expect(prismaService.participant.create).toHaveBeenCalledWith({
        data: {
          userId,
          eventId: registerDto.eventId
        },
        include: {
          event: true
        }
      });
    });

    it('should throw BadRequestException if event is full', async () => {
      (eventsService.findOne as jest.Mock).mockResolvedValue(event);
      (prismaService.participant.count as jest.Mock).mockResolvedValue(10); // Full

      await expect(service.register(userId, registerDto)).rejects.toThrow(BadRequestException);
      expect(prismaService.participant.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if user is already registered', async () => {
      (eventsService.findOne as jest.Mock).mockResolvedValue(event);
      (prismaService.participant.count as jest.Mock).mockResolvedValue(5);
      (prismaService.participant.findUnique as jest.Mock).mockResolvedValue({
        id: 1,
        userId,
        eventId: registerDto.eventId,
        createdAt: new Date()
      });

      await expect(service.register(userId, registerDto)).rejects.toThrow(ConflictException);
      expect(prismaService.participant.create).not.toHaveBeenCalled();
    });
  });

  describe('unregister', () => {
    const userId = 1;
    const eventId = 2;
    const participant = {
      id: 1,
      userId,
      eventId,
      createdAt: new Date()
    };

    it('should unregister a participant successfully', async () => {
      (prismaService.participant.findUnique as jest.Mock).mockResolvedValue(participant);
      (prismaService.participant.delete as jest.Mock).mockResolvedValue(participant);

      const result = await service.unregister(userId, eventId);
      expect(result).toEqual(participant);
      expect(prismaService.participant.delete).toHaveBeenCalledWith({
        where: { id: participant.id }
      });
    });

    it('should throw NotFoundException if registration not found', async () => {
      (prismaService.participant.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.unregister(userId, eventId)).rejects.toThrow(NotFoundException);
      expect(prismaService.participant.delete).not.toHaveBeenCalled();
    });
  });

  describe('getEventParticipants', () => {
    const eventId = 2;
    const participants = [
      {
        id: 1,
        userId: 1,
        eventId,
        createdAt: new Date(),
        user: {
          id: 1,
          username: 'user1',
          email: 'user1@example.com'
        }
      },
      {
        id: 2,
        userId: 2,
        eventId,
        createdAt: new Date(),
        user: {
          id: 2,
          username: 'user2',
          email: 'user2@example.com'
        }
      }
    ];

    it('should return all participants for an event', async () => {
      (eventsService.findOne as jest.Mock).mockResolvedValue({ id: eventId });
      (prismaService.participant.findMany as jest.Mock).mockResolvedValue(participants);

      const result = await service.getEventParticipants(eventId);
      expect(result).toEqual(participants);
      expect(prismaService.participant.findMany).toHaveBeenCalledWith({
        where: { eventId },
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
    });

    it('should throw NotFoundException if event does not exist', async () => {
      (eventsService.findOne as jest.Mock).mockRejectedValue(new NotFoundException());

      await expect(service.getEventParticipants(eventId)).rejects.toThrow(NotFoundException);
      expect(prismaService.participant.findMany).not.toHaveBeenCalled();
    });
  });
});
