import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsArray,
  IsEmail,
  IsObject,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ServiceDto {
  id: string;
  name: string;
  serviceDuration: number;
  breakDuration: number;
  maxBookableDays: number;
  maxClientPerSlot: number;

  ServiceBreak: ServiceBreakDto[];
  ServiceOffTime: ServiceOffTimeDto[];
  ServiceDailyWorkingHours: ServiceDailyWorkingHoursDto[];

  bookedSlots?: AppointmentDto[];
  bookableSlots?: BookableSlotDto[];
}

export interface BookableSlotDto {
  start: Date;
  end: Date;
  emptySlots: number;
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

export class AppointmentDto {
  id: string;

  // @IsNumber()
  @IsNotEmpty()
  startTime: number;

  // @IsNumber()
  @IsNotEmpty()
  endTime: number;

  @IsString()
  @IsNotEmpty()
  serviceId: string;
}

export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsObject()
  @ValidateNested({ each: true })
  @Type(() => AppointmentDto)
  appointment: AppointmentDto;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ClientDto)
  @ArrayMinSize(1)
  clients: ClientDto[];
}

export class ClientDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
export class GetClientDto extends ClientDto {
  id: string;
}
