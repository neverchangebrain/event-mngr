import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from './prisma.health';
import { PrismaService } from '../prisma/prisma.service';

describe('PrismaHealthIndicator', () => {
  let healthIndicator: PrismaHealthIndicator;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaHealthIndicator,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: jest.fn()
          }
        }
      ]
    }).compile();

    healthIndicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(healthIndicator).toBeDefined();
  });

  it('should return status up when database is accessible', async () => {
    (prismaService.$queryRaw as jest.Mock).mockResolvedValue(true);

    const result = await healthIndicator.pingCheck('database');

    expect(result).toEqual({
      database: {
        status: 'up'
      }
    });
    expect(prismaService.$queryRaw).toHaveBeenCalled();
  });

  it('should return status down when database is not accessible', async () => {
    const errorMessage = 'Could not connect to database';
    const error = new Error(errorMessage);
    (prismaService.$queryRaw as jest.Mock).mockRejectedValue(error);

    const result = await healthIndicator.pingCheck('database');

    expect(result).toEqual({
      database: {
        status: 'down',
        message: errorMessage
      }
    });
    expect(prismaService.$queryRaw).toHaveBeenCalled();
  });
});
