import { Controller, Get } from '@nestjs/common';
import { ClientService } from './client.service';

@Controller('scheduling/client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get()
  getSchedules(): string {
    return this.clientService.getSchedules();
  }
}
