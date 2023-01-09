import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getDayInFuture } from '../../helpers/util';
import {
  BookableSlotDto,
  CreateAppointmentDto,
  ServiceDto,
  AppointmentDto,
  ClientDto,
  GetClientDto,
} from '../dto';
import { ClientService } from '../../client/client.service';
import { ServicesService } from '../../service/services.service';

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private clientService: ClientService,
    private servicesService: ServicesService,
  ) {}

  private async loadBookedSlots(service: ServiceDto) {
    return await this.prisma.appointment.findMany({
      where: {
        startTime: {
          gt: new Date(),
          lt: getDayInFuture(service.maxBookableDays + 1),
        },
      },
    });
  }

  private async generateBookableSlotsForService(
    service: ServiceDto,
  ): Promise<ServiceDto> {
    // booked slots for this service
    const bookedSlots = await this.loadBookedSlots(service);

    const bookableSlots = [];
    // generate bookable slots for each day
    for (let i = 0, l = service.maxBookableDays; i < l; i++) {
      // get the work hours for this day
      const workHours = service.ServiceDailyWorkingHours.find(
        (workingHour) => workingHour.weekDay === i,
      );
      // if not then it's on off day
      if (!workHours) continue;

      const startOfDayDate = getDayInFuture(i);
      let startTime = startOfDayDate.getTime() + workHours.startTime;
      const endTime = startOfDayDate.getTime() + workHours.endTime;
      const now = Date.now();

      while (true) {
        if (startTime > now) {
          const start = startTime;
          const end = start + service.serviceDuration;
          // find out if this time is already booked and how many times
          const bookedSlotsForThisSlot = bookedSlots.filter(
            // is start between this slot's startTime and endTime
            // OR
            // is end between this slot's startTime and endTime
            (slot) =>
              (slot.startTime.getTime() >= start &&
                start <= slot.endTime.getTime()) ||
              (slot.startTime.getTime() >= end &&
                end <= slot.endTime.getTime()),
          );
          if (bookedSlotsForThisSlot.length < service.maxClientPerSlot) {
            const emptySlots =
              service.maxClientPerSlot - bookedSlotsForThisSlot.length;
            // returning date object for better human readability
            bookableSlots.push({
              start: new Date(start),
              end: new Date(end),
              emptySlots,
            });
          }
        }

        // forward to the next time slot
        startTime += service.serviceDuration + service.breakDuration;

        // reached the working hours end time
        if (startTime >= endTime) break;
      }
    }

    service.bookableSlots = bookableSlots;
    return service;
  }

  // generally user should first select which service they want and then we load the data for that
  // service
  async getSchedules(): Promise<ServiceDto[]> {
    const services = await this.servicesService.getServices();

    // preferably the processing part should be offloaded to the client side
    return await Promise.all<ServiceDto[]>(
      services.map(this.generateBookableSlotsForService.bind(this)),
    );
  }

  async createAppointment(appointment: AppointmentDto, client: GetClientDto) {
    const { startTime, endTime, serviceId } = appointment;
    const data = await this.prisma.appointment.create({
      data: {
        serviceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        clientId: client.id,
      },
    });

    return {
      appointment: data,
      client,
    };
  }

  async postAppointment(data: CreateAppointmentDto) {
    const { clients, appointment } = data;
    const { serviceId } = appointment;
    const startTime = new Date(appointment.startTime).getTime();
    const endTime = new Date(appointment.endTime).getTime();
    const now = Date.now();

    if (startTime < now || endTime < now || endTime < startTime)
      throw new HttpException(
        'Cannot book an appointment in the past',
        HttpStatus.BAD_REQUEST,
      );

    // get the service
    const service = await this.servicesService.getService(serviceId);

    if (!service)
      throw new HttpException(`Service not found`, HttpStatus.BAD_REQUEST);

    await this.generateBookableSlotsForService(service);
    const slot = service.bookableSlots.find(
      (slot) =>
        slot.start.getTime() === startTime && slot.end.getTime() === endTime,
    );

    if (!slot || slot.emptySlots < clients.length)
      throw new HttpException(
        `Unfortunately there is no empty slot for the selected time`,
        HttpStatus.NOT_ACCEPTABLE,
      );

    // create/update the clients first
    const updatedClients = await Promise.all(
      clients.map((c) => this.clientService.createClient(c)),
    );

    return await Promise.all(
      updatedClients.map((client) =>
        this.createAppointment(appointment, client),
      ),
    );
  }
}
