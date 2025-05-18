import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantsController } from './participants.controller';
import { ParticipantsService } from './participants.service';
import { RegisterParticipantDto } from './dto/register-participant.dto';

describe('ParticipantsController', () => {
  let controller: ParticipantsController;
  let service: ParticipantsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParticipantsController],
      providers: [
        {
          provide: ParticipantsService,
          useValue: {
            register: jest.fn(),
            unregister: jest.fn(),
            getEventParticipants: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<ParticipantsController>(ParticipantsController);
    service = module.get<ParticipantsService>(ParticipantsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should register a participant', async () => {
      const req = { user: { id: 1 } };
      const registerDto: RegisterParticipantDto = { eventId: 2 };
      const participant = {
        id: 1,
        userId: 1,
        eventId: 2,
        createdAt: new Date(),
        event: { id: 2, name: 'Event' }
      };

      (service.register as jest.Mock).mockResolvedValue(participant);

      expect(await controller.register(req, registerDto)).toBe(participant);
      expect(service.register).toHaveBeenCalledWith(req.user.id, registerDto);
    });
  });

  describe('unregister', () => {
    it('should unregister a participant', async () => {
      const req = { user: { id: 1 } };
      const eventId = '2';
      const participant = {
        id: 1,
        userId: 1,
        eventId: 2,
        createdAt: new Date()
      };

      (service.unregister as jest.Mock).mockResolvedValue(participant);

      expect(await controller.unregister(req, eventId)).toBe(participant);
      expect(service.unregister).toHaveBeenCalledWith(req.user.id, 2);
    });
  });

  describe('getEventParticipants', () => {
    it('should return participants for an event', async () => {
      const eventId = '2';
      const participants = [
        {
          id: 1,
          userId: 1,
          eventId: 2,
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
          eventId: 2,
          createdAt: new Date(),
          user: {
            id: 2,
            username: 'user2',
            email: 'user2@example.com'
          }
        }
      ];

      (service.getEventParticipants as jest.Mock).mockResolvedValue(participants);

      expect(await controller.getEventParticipants(eventId)).toBe(participants);
      expect(service.getEventParticipants).toHaveBeenCalledWith(2);
    });
  });
});
