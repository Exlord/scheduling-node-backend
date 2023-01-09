import { Test, TestingModule } from '@nestjs/testing';
import { ServicesService } from './services.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ServiceService', () => {
  let service: ServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicesService, PrismaService],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
