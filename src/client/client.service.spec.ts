import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClientDto } from '../scheduling/dto';

describe('ClientService', () => {
  let service: ClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientService, PrismaService],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create or update a client and return the full data', async () => {
    const client = await service.createClient({
      email: 'email',
      firstName: 'firstName',
      lastName: 'lastName',
    } as unknown as ClientDto);
    expect(client).toBeDefined();
    expect(client.email).toBe('email');
    expect(client.firstName).toBe('firstName');
    expect(client.lastName).toBe('lastName');
    expect(client.id).toBeDefined();
  });
});
