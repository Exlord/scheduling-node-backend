import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment/appointment.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ClientModule } from '../client/client.module';
import { AppointmentService } from './appointment/appointment.service';

@Module({
  imports: [PrismaModule, ClientModule],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class SchedulingModule {}
