import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

describe('ProfileController', () => {
  let controller: ProfileController;

  const mockProfileService = {
    getProfileWithFact: jest.fn().mockResolvedValue({
      status: 'success',
      user: {
        email: 'test@example.com',
        name: 'Test User',
        stack: 'Test Stack',
      },
      timestamp: '2024-01-15T10:30:45.123Z',
      fact: 'Test cat fact',
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return profile data', async () => {
      const result = await controller.getProfile();
      
      expect(result.status).toBe('success');
      expect(result.user?.email).toBe('test@example.com');
      expect(result.timestamp).toBeDefined();
      expect(result.fact).toBe('Test cat fact');
    });
  });
});