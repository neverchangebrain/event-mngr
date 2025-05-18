import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    createdAt: new Date()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findById: jest.fn()
          }
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password'
    };

    (service.create as jest.Mock).mockResolvedValue(mockUser);

    const result = await controller.create(createUserDto);

    expect(result).toBe(mockUser);
    expect(service.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should throw ConflictException when user already exists', async () => {
    const createUserDto: CreateUserDto = {
      username: 'existinguser',
      email: 'existing@example.com',
      password: 'password'
    };

    (service.create as jest.Mock).mockRejectedValue(new ConflictException());

    await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
    expect(service.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should return the user profile', async () => {
    const req = {
      user: {
        id: 1
      }
    };

    (service.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await controller.getProfile(req);

    expect(result).toBe(mockUser);
    expect(service.findById).toHaveBeenCalledWith(req.user.id);
  });
});
