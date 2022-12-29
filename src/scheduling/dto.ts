export interface ServiceDto {
  id: string;
  name: string;
  serviceDuration: number;
  breakDuration: number;
  maxBookableDays: number;
  maxClientPerSlot: number;

  ServiceBreak: ServiceBreakDto[];
  ServiceOffTime: ServiceOffTimeDto[];
  ServiceDailyWorkingHours: ServiceDailyWorkingHoursDto[];

  bookedSlots: AppointmentDto[];
  bookableSlots: BookableSlotDto[];
}

export interface BookableSlotDto {
  start: number;
  end: number;
}

export interface ServiceBreakDto {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  serviceId: string;
}

export interface ServiceOffTimeDto {
  id: string;
  name: string;
  start: Date;
  end: Date;
  serviceId: string;
}

export interface ServiceDailyWorkingHoursDto {
  id: string;
  weekDay: number;
  startTime: number;
  endTime: number;
  serviceId: string;
}

export interface AppointmentDto {
  id: string;
  startTime: number;
  endTime: number;
  clientId: string;
  serviceId: string;
}
