import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEvent = {
    id: 1,
    name: 'Test Event',
    description: 'Test Description',
    date: new Date('2025-12-31'),
    location: 'Test Location',
    maxParticipants: 100,
    createdAt: new Date(),
    _count: {
      participants: 5
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      (service.create as jest.Mock).mockResolvedValue(mockEvent);

      const result = await controller.create(createEventDto);

      expect(result).toBe(mockEvent);
      expect(service.create).toHaveBeenCalledWith(createEventDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const mockEvents = [mockEvent, mockEvent];

      (service.findAll as jest.Mock).mockResolvedValue(mockEvents);

      const result = await controller.findAll();

      expect(result).toBe(mockEvents);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single event by id', async () => {
      (service.findOne as jest.Mock).mockResolvedValue(mockEvent);

      const result = await controller.findOne('1');

      expect(result).toBe(mockEvent);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const updateEventDto: UpdateEventDto = {
        name: 'Updated Event',
        maxParticipants: 150
      };

      const updatedEvent = {
        ...mockEvent,
        name: 'Updated Event',
        maxParticipants: 150
      };

      (service.update as jest.Mock).mockResolvedValue(updatedEvent);

      const result = await controller.update('1', updateEventDto);

      expect(result).toBe(updatedEvent);
      expect(service.update).toHaveBeenCalledWith(1, updateEventDto);
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      (service.remove as jest.Mock).mockResolvedValue(mockEvent);

      const result = await controller.remove('1');

      expect(result).toBe(mockEvent);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
