import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ServiceDto } from '../scheduling/dto';

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  private updateService(service: ServiceDto): ServiceDto {
    // times are in seconds but for calculations we need them to be in milliseconds
    service.serviceDuration *= 1000;
    service.breakDuration *= 1000;
    service.ServiceDailyWorkingHours.map((wh) => {
      wh.endTime *= 1000;
      wh.startTime *= 1000;
      return wh;
    });
    service.ServiceBreak.map((b) => {
      b.endTime *= 1000;
      b.startTime *= 1000;
      return b;
    });

    return service;
  }

  async getServices() {
    return (
      await this.prisma.service.findMany({
        include: {
          ServiceBreak: true,
          ServiceOffTime: true,
          ServiceDailyWorkingHours: true,
        },
      })
    ).map(this.updateService);
  }

  async getService(id: string): Promise<ServiceDto> {
    const service = await this.prisma.service.findUnique({
      where: { id },
      include: {
        ServiceBreak: true,
        ServiceOffTime: true,
        ServiceDailyWorkingHours: true,
      },
    });

    if (service) this.updateService(service);

    return service;
  }
}
