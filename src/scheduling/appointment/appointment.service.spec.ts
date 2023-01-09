import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientService } from '../../client/client.service';
import { ServicesService } from '../../service/services.service';

describe('AppointmentService', () => {
  let service: AppointmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        PrismaService,
        ClientService,
        ServicesService,
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return available slots', async () => {
    const data = await service.getSchedules();
    expect(data).toBeDefined();
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data[0].name).toBe('Men Haircut');
  });
});
