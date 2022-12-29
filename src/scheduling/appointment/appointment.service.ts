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

@Injectable()
export class AppointmentService {
  constructor(
    private prisma: PrismaService,
    private clientService: ClientService,
  ) {}

  private async loadBookedSlots(service: ServiceDto) {
    return (
      (await this.prisma.appointment.findMany({
        where: {
          startTime: {
            gt: new Date(),
            lt: getDayInFuture(service.maxBookableDays + 1),
          },
        },
      })) as unknown as AppointmentDto[]
    ).map((slot) => {
      slot.startTime = new Date(slot.startTime).getTime();
      slot.endTime = new Date(slot.endTime).getTime();
      return slot;
    });
  }

  private async generateBookableSlotsForService(
    service: ServiceDto,
    bookedSlots: AppointmentDto[],
  ) {
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
      let startTime = startOfDayDate.getTime() + workHours.startTime * 1000;
      const endTime = startOfDayDate.getTime() + workHours.endTime * 1000;
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
              (slot.startTime >= start && start <= slot.endTime) ||
              (slot.startTime >= end && end <= slot.endTime),
          );
          if (bookedSlotsForThisSlot.length < service.maxClientPerSlot) {
            const emptySlots =
              service.maxClientPerSlot - bookedSlotsForThisSlot.length;
            bookableSlots.push({
              start,
              end,
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

    return bookableSlots;
  }

  private async processService(service: ServiceDto) {
    return new Promise(async (resolve) => {
      // booked slots for this service
      service.bookedSlots = await this.loadBookedSlots(service);
      service.bookableSlots = await this.generateBookableSlotsForService(
        service,
        service.bookedSlots,
      );
      resolve(service);
    });
  }

  // generally user should first select which service they want and then we load the data for that
  // service
  async getSchedules() {
    const services = (await this.prisma.service.findMany({
      include: {
        ServiceBreak: true,
        ServiceOffTime: true,
        ServiceDailyWorkingHours: true,
      },
    })) as unknown as ServiceDto[];

    const waitQueue = [];
    services.forEach((service) => {
      waitQueue.push(this.processService(service));
    });

    await Promise.all(waitQueue);

    return services;
  }

  async createAppointment(appointment: AppointmentDto, client: GetClientDto) {
    const { startTime, endTime, serviceId } = appointment;
    const data = (await this.prisma.appointment.create({
      data: {
        serviceId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        clientId: client.id,
      },
    })) as unknown as AppointmentDto;

    // set the dates at timestamp to return to client
    data.startTime = startTime;
    data.endTime = endTime;

    return {
      appointment: data,
      client,
    };
  }

  async postAppointment(data: CreateAppointmentDto) {
    const { clients, appointment } = data;
    const { startTime, endTime, serviceId } = appointment;
    const now = Date.now();

    if (startTime < now || endTime < now || endTime < startTime)
      throw new HttpException(
        'Cannot book an appointment in the past',
        HttpStatus.BAD_REQUEST,
      );

    // get the service
    const service = (await this.prisma.service.findUnique({
      where: {
        id: serviceId,
      },
      include: {
        ServiceBreak: true,
        ServiceOffTime: true,
        ServiceDailyWorkingHours: true,
      },
    })) as unknown as ServiceDto;

    if (!service)
      throw new HttpException(`Service not found`, HttpStatus.BAD_REQUEST);

    await this.processService(service);
    const slot = service.bookableSlots.find(
      (slot) => slot.start === startTime && slot.end === endTime,
    );

    if (!slot || slot.emptySlots < clients.length)
      throw new HttpException(
        `Unfortunately there is no empty slot for the selected time`,
        HttpStatus.NOT_ACCEPTABLE,
      );

    // create/update the clients first
    let waitQueue = [];
    clients.forEach((client) => {
      waitQueue.push(this.clientService.createClient(client));
    });
    const updatedClients = await Promise.all(waitQueue);

    waitQueue = [];
    updatedClients.forEach((client) => {
      waitQueue.push(this.createAppointment(appointment, client));
    });

    return await Promise.all(waitQueue);
  }
}
