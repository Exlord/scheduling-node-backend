import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClientDto } from '../scheduling/dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async createClient(clientData: ClientDto) {
    const { email, lastName, firstName } = clientData;
    return this.prisma.client.upsert({
      where: {
        email,
      },
      update: {
        lastName,
        firstName,
      },
      create: {
        email,
        lastName,
        firstName,
      },
    });
  }
}
