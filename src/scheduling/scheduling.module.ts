import { Module } from '@nestjs/common';
import { ClientController } from './client/client.controller';
import { ClientService } from './client/client.service';

@Module({
  controllers: [ClientController],
  providers: [ClientService],
})
export class SchedulingModule {}
