import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let jwtToken: string;

  // Mock PrismaService
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn()
    },
    event: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    participant: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn()
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '1': 1 }])
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Check', () => {
    it('/health (GET)', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            status: 'ok',
            info: { database: { status: 'up' }, api: { status: 'up' } },
            error: {},
            details: { database: { status: 'up' }, api: { status: 'up' } }
          });
        });
    });
  });

  describe('Auth', () => {
    it('should register a new user', () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date()
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mockUser);
        });
    });

    it('should login a user', () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuv', // Mock hashed password
        createdAt: new Date()
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Mock bcrypt.compare to return true
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true)
      }));

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          jwtToken = res.body.access_token; // Save token for authenticated requests
        });
    });
  });

  describe('Events', () => {
    it('should get all events', () => {
      const mockEvents = [
        {
          id: 1,
          name: 'Test Event',
          description: 'Test Description',
          date: new Date().toISOString(),
          location: 'Test Location',
          maxParticipants: 100,
          createdAt: new Date().toISOString(),
          _count: { participants: 5 }
        }
      ];

      mockPrismaService.event.findMany.mockResolvedValue(mockEvents);

      return request(app.getHttpServer())
        .get('/events')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual(mockEvents);
        });
    });

    it('should create an event (authenticated)', () => {
      const createEventDto = {
        name: 'New Event',
        description: 'New Description',
        date: new Date().toISOString(),
        location: 'New Location',
        maxParticipants: 50
      };

      const mockEvent = {
        id: 2,
        ...createEventDto,
        createdAt: new Date().toISOString()
      };

      mockPrismaService.event.create.mockResolvedValue(mockEvent);

      return request(app.getHttpServer())
        .post('/events')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(createEventDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mockEvent);
        });
    });
  });

  describe('Participants', () => {
    it('should register for an event (authenticated)', () => {
      const registerDto = {
        eventId: 1
      };

      const mockEvent = {
        id: 1,
        name: 'Test Event',
        maxParticipants: 100,
        _count: { participants: 5 }
      };

      const mockParticipant = {
        id: 1,
        userId: 1,
        eventId: 1,
        createdAt: new Date().toISOString(),
        event: mockEvent
      };

      mockPrismaService.event.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.participant.count.mockResolvedValue(5);
      mockPrismaService.participant.findUnique.mockResolvedValue(null);
      mockPrismaService.participant.create.mockResolvedValue(mockParticipant);

      return request(app.getHttpServer())
        .post('/participants/register')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send(registerDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toEqual(mockParticipant);
        });
    });
  });
});
