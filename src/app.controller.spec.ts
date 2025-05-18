import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            checkHealth: jest.fn()
          }
        }
      ]
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('healthCheck', () => {
    it('should return health check results', async () => {
      const result = {
        status: 'ok',
        info: { database: { status: 'up' }, api: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' }, api: { status: 'up' } }
      };

      (appService.checkHealth as jest.Mock).mockResolvedValue(result);

      expect(await appController.healthCheck()).toBe(result);
      expect(appService.checkHealth).toHaveBeenCalled();
    });
  });
});
