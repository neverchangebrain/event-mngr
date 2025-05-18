import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { HealthCheckService, PrismaHealthIndicator } from '@nestjs/terminus';
import { PrismaService } from './prisma/prisma.service';

describe('AppService', () => {
  let service: AppService;
  let healthCheckService: HealthCheckService;
  let prismaHealthIndicator: PrismaHealthIndicator;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn()
          }
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest.fn()
          }
        },
        {
          provide: PrismaService,
          useValue: {}
        }
      ]
    }).compile();

    service = module.get<AppService>(AppService);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    prismaHealthIndicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should perform health check', async () => {
      // Mock the health check service
      const healthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' }, api: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' }, api: { status: 'up' } }
      };

      (healthCheckService.check as jest.Mock).mockResolvedValue(healthCheckResult);
      (prismaHealthIndicator.pingCheck as jest.Mock).mockResolvedValue({
        database: { status: 'up' }
      });

      const result = await service.checkHealth();

      expect(healthCheckService.check).toHaveBeenCalled();
      expect(result).toEqual(healthCheckResult);
    });
  });
});
