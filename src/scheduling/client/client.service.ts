import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { getDayInFuture } from '../../helpers/util';
import { AppointmentDto, BookableSlotDto, ServiceDto } from '../dto';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

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
            bookableSlots.push({ start, end });
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
}
