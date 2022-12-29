import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from '../dto';

@Controller('scheduling/appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  getSchedules() {
    return this.appointmentService.getSchedules();
  }

  @Post()
  postAppointment(@Body() data: CreateAppointmentDto) {
    return this.appointmentService.postAppointment(data);
  }
}
