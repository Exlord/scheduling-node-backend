import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentController } from './appointment.controller';
import { ClientService } from '../../client/client.service';
import { AppointmentService } from './appointment.service';
import { PrismaService } from '../../prisma/prisma.service';
import { AppointmentDto, CreateAppointmentDto } from '../dto';
import {
  ArgumentMetadata,
  HttpException,
  ValidationPipe,
} from '@nestjs/common';
import { ServicesService } from '../../service/services.service';

describe('AppointmentController', () => {
  let controller: AppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppointmentController],
      providers: [
        ClientService,
        AppointmentService,
        PrismaService,
        ServicesService,
      ],
    }).compile();

    controller = module.get<AppointmentController>(AppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
  it('validate DTO', async () => {
    const target: ValidationPipe = new ValidationPipe({
      transform: true,
      whitelist: true,
    });
    await target
      .transform(
        {},
        {
          type: 'body',
          metatype: CreateAppointmentDto,
        },
      )
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages.length).toBeGreaterThan(4);
        expect(messages).toContain('appointment must be an object');
        expect(messages).toContain('appointment should not be empty');
        expect(messages).toContain('clients should not be empty');
        expect(messages).toContain('clients must be an array');
      });

    await target
      .transform(
        { appointment: '' },
        {
          type: 'body',
          metatype: CreateAppointmentDto,
        },
      )
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toContain('appointment must be an object');
      });

    await target
      .transform(
        { appointment: {}, clients: [] },
        {
          type: 'body',
          metatype: CreateAppointmentDto,
        },
      )
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages.length).toBeGreaterThan(4);
      });

    await target
      .transform(
        {
          appointment: { startTime: 1, endTime: 1, serviceId: '1' },
          clients: [],
        },
        {
          type: 'body',
          metatype: CreateAppointmentDto,
        },
      )
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toContain('clients must contain at least 1 elements');
      });
    await target
      .transform(
        {
          appointment: {
            startTime: 1,
            endTime: 1,
            serviceId: 'string',
          },
          clients: [
            {
              firstName: 'string',
              lastName: 'string',
              email: 'string',
            },
          ],
        },
        {
          type: 'body',
          metatype: CreateAppointmentDto,
        },
      )
      .catch((err) => {
        const messages = err.getResponse().message;
        expect(messages).toContain('clients.0.email must be an email');
      });
  });
  it('should not create an appointment', async () => {
    let appointment;
    try {
      appointment = await controller.postAppointment({
        appointment: { startTime: 1, endTime: 1, serviceId: '1' },
        clients: [
          { firstName: 'name', lastName: 'name', email: 'email@domain.com' },
        ],
      } as unknown as CreateAppointmentDto);
    } catch (e) {
      expect(e).toBeInstanceOf(HttpException);
    }
    expect(appointment).toBeUndefined();
  });
});
